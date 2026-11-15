import { Modal, Button, StatusBadge, KeyValueList, ActivityTimeline } from '../../shared';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { isOwned } from '../../../store/features/bde/bdeFns';
import { fmtDate, fmtLocal } from '../../../utils/utils';

export default function LeadDetailModal({ id, onClose, open }) {
  const l = useBdeStore((s) => s.leads.find((x) => x.id === Number(id)));
  if (!l) return null;
  const edit = isOwned(l);
  const read = !edit && l.status !== 'Available';
  return (
    <Modal title={l.name} onClose={onClose}>
      <p className="text-muted">NPI {l.npi} · {l.type} · {l.state}</p>
      <div className="my-3 flex flex-wrap items-center gap-3">
        <StatusBadge label={l.status} tone="default" />
        {edit ? (
          <>
            <Button variant="primary" onClick={() => open('call', l.id)}>Record disposition</Button>
            <Button onClick={() => open('handoff', l.id)}>Transfer / share</Button>
            <Button onClick={() => open('contact', l.id)}>Add contact</Button>
            {l.appt && <Button onClick={() => open('meeting', l.id)}>Manage meeting</Button>}
          </>
        ) : l.status === 'Available' ? (
          <Button variant="primary" onClick={() => open('claim', l.id)}>Assign to me</Button>
        ) : (
          <StatusBadge label="Read only" tone="default" />
        )}
      </div>

      <Section title="Provider record" open>
        <KeyValueList
          items={{
            'Legal name': l.name,
            'Primary specialty': l.specialty,
            'Enumeration date': fmtDate(l.enum),
            'Primary practice': `${l.city}, ${l.state}`,
            'Provider time zone': l.tz,
            Source: l.id % 2 ? 'Sample weekly update' : 'Sample baseline',
            'Practice phone': l.phones[0].value,
          }}
        />
      </Section>
      <Section title="Taxonomy, licensing & source fields">
        <KeyValueList
          items={{
            'Primary taxonomy': l.specialty,
            'License number': 'Unavailable in sample',
            'Mailing address': 'Unavailable in sample',
            'Authorized official': 'Unavailable in sample',
            'Secondary practice locations': 'None in sample',
            'Endpoint records': 'None in sample',
          }}
        />
      </Section>
      {(edit || read) && (
        <>
          <Section title="Sales details & contacts" open>
            <KeyValueList
              items={{
                Owner: l.owner,
                Services: l.services.join(', '),
                Email: l.email,
                'Phone records': l.phones.map((p) => p.value + ' · ' + p.source + (p.ok ? '' : ' · Wrong number')).join(' / '),
                'Next follow-up': fmtLocal(l.follow?.at),
                'Ownership expiry': l.expiry ? fmtLocal(l.expiry) : 'Protected or closed',
                'Read-only collaborators': l.shares.join(', '),
              }}
            />
          </Section>
          <Section title="Activity history" open>
            <ActivityTimeline items={l.history.map((e) => ({ title: e.label, meta: `${fmtLocal(e.at)} · ${e.by}`, note: e.note }))} />
          </Section>
        </>
      )}
    </Modal>
  );
}

function Section({ title, open, children }) {
  return (
    <details open={open} className="border-t border-line py-2.5">
      <summary className="cursor-pointer font-semibold">{title}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
