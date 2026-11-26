import { useEffect, useState } from 'react';
import { Modal, Button, StatusBadge, KeyValueList, ActivityTimeline, ErrorBanner, showToast } from '../shared';
import { useLeadDetailStore } from '../../store/features/leads/useLeadDetailStore';
import { useLeadPoolStore } from '../../store/features/leads/useLeadPoolStore';
import { friendlyError } from '../../store/features/leads/errors';
import { fmtDate, fmtLocal } from '../../utils/utils';
import { quotaExhausted } from './leadUtils';

function Section({ title, open, children }) {
  return (
    <details open={open} className="border-t border-line py-2.5">
      <summary className="cursor-pointer font-semibold">{title}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

const SOON = 'Connected in a later backend step';

/**
 * Real lead detail (GET /leads/:id) for the BDE workspace and the company admin.
 * Buttons follow `permissions`; disposition / meeting / transfer-request stay on the dummy flow, so they are
 * disabled here for real leads.
 */
export default function LeadDetailDialog({ id, onClose, open }) {
  const detail = useLeadDetailStore((s) => (s.detail?.lead.id === id ? s.detail : null));
  const isLoading = useLeadDetailStore((s) => s.isLoading);
  const error = useLeadDetailStore((s) => s.error);
  const openLead = useLeadDetailStore((s) => s.openLead);
  const close = useLeadDetailStore((s) => s.close);
  const claim = useLeadPoolStore((s) => s.claim);
  const quota = useLeadPoolStore((s) => s.meta?.claimQuota);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => { openLead(id, { silent: true }); }, [id, openLead]);
  const closeAll = () => { close(); onClose(); };

  if (!detail) {
    return (
      <Modal title={error ? 'Lead unavailable' : 'Loading lead…'} onClose={closeAll}>
        {error ? <ErrorBanner message={error} onRetry={() => openLead(id)} /> : <p role="status" className="py-4 text-muted">{isLoading ? 'Loading…' : ''}</p>}
      </Modal>
    );
  }

  const { lead: l, permissions, history } = detail;
  const showSales = l.stage !== 'Available';

  const onClaim = async () => {
    setClaiming(true);
    try {
      await claim([l.id]);
      await openLead(l.id, { silent: true });
    } catch (err) {
      showToast(friendlyError(err));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Modal title={l.name} onClose={closeAll}>
      <p className="text-muted">NPI {l.npi} · {l.providerType} · {[l.city, l.state].filter(Boolean).join(', ')}</p>
      <div className="my-3 flex flex-wrap items-center gap-3">
        <StatusBadge label={l.stage} tone="default" />
        {permissions.canClaim && (
          <Button variant="primary" disabled={claiming || quotaExhausted(quota)} onClick={onClaim}>Assign to me</Button>
        )}
        {permissions.canEdit && (
          <>
            <Button variant="primary" disabled title={SOON}>Record disposition</Button>
            <Button onClick={() => open('apiShare', l.id)}>Transfer / share</Button>
            <Button onClick={() => open('apiContact', l.id)}>Add contact</Button>
          </>
        )}
        {permissions.readOnly && <StatusBadge label="Read only" tone="default" />}
      </div>

      <Section title="Provider record" open>
        <KeyValueList
          items={{
            'Legal name': l.name,
            'Primary specialty': l.specialty,
            'Enumeration date': l.enumerationDate ? fmtDate(l.enumerationDate) : '',
            'Primary practice': [l.city, l.state].filter(Boolean).join(', '),
            'Provider time zone': l.timezone,
            Source: l.source,
            'Practice phone': l.phones?.[0]?.value,
            Score: l.score,
          }}
        />
      </Section>

      {showSales && (
        <>
          <Section title="Sales details & contacts" open>
            <KeyValueList
              items={{
                Owner: l.owner?.name,
                Services: (l.services || []).join(', '),
                Email: l.email,
                'Phone records': (l.phones || [])
                  .map((p) => `${p.value} · ${p.source || 'Unknown source'}${p.ok === false ? ' · Wrong number' : ''}${p.verified ? ' · Verified' : ''}`)
                  .join(' / '),
                Attempts: l.attempts,
                'Last activity': l.lastActivityAt ? fmtLocal(l.lastActivityAt) : '',
                'Next follow-up': l.nextFollowUpAt ? fmtLocal(l.nextFollowUpAt) : '',
                'Ownership expiry': l.expiresAt ? fmtLocal(l.expiresAt) : 'Protected or closed',
                'Read-only collaborators': (l.sharedWith || []).map((u) => u.name).join(', '),
              }}
            />
          </Section>
          <Section title="Activity history" open>
            {history.length ? (
              <ActivityTimeline items={history.map((e) => ({ title: e.label, meta: `${fmtLocal(e.at)} · ${e.by}`, note: e.note }))} />
            ) : (
              <p className="text-muted">No activity yet.</p>
            )}
          </Section>
        </>
      )}
    </Modal>
  );
}
