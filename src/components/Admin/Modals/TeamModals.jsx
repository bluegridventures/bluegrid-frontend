import { useEffect, useState } from 'react';
import { FormModal, Field, SelectField, TextAreaField, FormRow, Table, KeyValueList } from '../../shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed } from '../../../store/features/admin/adminFns';
import { useTeamStore } from '../../../store/features/team/useTeamStore';
import { useSettingsStore } from '../../../store/features/settings/useSettingsStore';
import { useMembersPicker } from '../../../store/features/team/useMembersStore';
import { suspendPreviewRequest } from '../../../store/features/team/teamFns';
import { AGENT_ROLE_OPTIONS } from '../../../store/constant';
import { agentName } from '../../../utils/utils';

/**
 * "New owner" now comes from GET /team/members. The leads themselves are still demo data (owner = demo
 * agent id), so the picked member is matched to the demo agent by name until the Leads API arrives.
 */
export function ReassignModal({ ids, onClose }) {
  const { leads, agents, reassignLeads } = useAdminStore();
  const { members, isLoading, error } = useMembersPicker();
  const eligible = ids.map((id) => leads.find((l) => l.id === id)).filter((l) => l && !isFixed(l));
  return (
    <FormModal
      title="Preview reassignment"
      submitLabel="Confirm reassignment"
      onClose={onClose}
      onSubmit={(p) => {
        if (!eligible.length) throw Error('Select an eligible lead first.');
        const demoOwner = agents.find((a) => a.name.toLowerCase() === String(p.owner).toLowerCase());
        if (!demoOwner) throw Error(`${p.owner} has no demo leads profile yet. Lead reassignment goes live with the Leads API.`);
        reassignLeads({ ids: eligible.map((l) => l.id), owner: demoOwner.id, note: p.note });
      }}
    >
      <Table
        columns={[
          { header: 'Provider', key: 'name' },
          { header: 'Current owner', cell: (l) => agentName(agents, l.owner) },
          { header: 'Stage', key: 'stage' },
        ]}
        rows={eligible}
      />
      <SelectField
        key={members.length}
        label="New owner"
        name="owner"
        placeholder={isLoading && !members.length ? 'Loading team…' : 'Select team member'}
        options={members.map((m) => ({ value: m.name, label: m.name }))}
      />
      {error && <p className="text-danger">Could not load team members: {error}</p>}
      <TextAreaField label="Reason" />
    </FormModal>
  );
}

const num = (v) => (v === '' || v == null ? undefined : Number(v));

/** Create (no id) or edit (id) a team member through POST / PATCH /admin/team. */
export function AgentFormModal({ id, onClose }) {
  const member = useTeamStore((s) => (id ? s.members.find((m) => m.id === id) : null));
  const { createMember, updateMember } = useTeamStore.getState();
  const settings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  // pre-fill the claim limit with the company default
  useEffect(() => { if (!id) fetchSettings(); }, [id, fetchSettings]);

  if (id && !member) return null;

  const onSubmit = async (p) => {
    const next = {
      name: p.name.trim(),
      email: p.email.trim(),
      phone: p.phone.trim(),
      role: p.role,
      claimLimitPerHour: num(p.claimLimitPerHour),
    };
    if (!member) {
      const body = { name: next.name, email: next.email, role: next.role };
      if (next.phone) body.phone = next.phone;
      if (next.claimLimitPerHour !== undefined) body.claimLimitPerHour = next.claimLimitPerHour;
      return createMember(body);
    }
    // PATCH: send only what changed
    const body = {};
    ['name', 'email', 'phone', 'role', 'claimLimitPerHour'].forEach((k) => {
      if (next[k] !== undefined && next[k] !== (member[k] ?? (k === 'phone' ? '' : undefined))) body[k] = next[k];
    });
    if (!Object.keys(body).length) throw Error('No changes to save.');
    return updateMember(member.id, body);
  };

  return (
    <FormModal
      title={member ? 'Edit agent' : 'Create agent'}
      submitLabel={member ? 'Save changes' : 'Create invitation'}
      successMessage={member ? 'Team member updated.' : 'Invitation created.'}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Field label="Full name" name="name" defaultValue={member?.name} maxLength={120} />
      <Field label="Work email" name="email" type="email" defaultValue={member?.email} />
      <Field label="Phone (optional)" name="phone" type="tel" defaultValue={member?.phone} required={false} />
      <FormRow>
        <SelectField label="Role" name="role" options={AGENT_ROLE_OPTIONS} defaultValue={member?.role} />
        <Field
          key={settings?.defaultClaimLimit ?? 'loading'}
          label="Hourly claim limit"
          name="claimLimitPerHour"
          type="number"
          defaultValue={member?.claimLimitPerHour ?? settings?.defaultClaimLimit ?? ''}
          min="1"
          max="500"
          required={false}
        />
      </FormRow>
      {!member && <p className="my-2 text-muted">An invitation email will be sent.</p>}
    </FormModal>
  );
}

const ACTIONS = {
  suspend: { prefix: 'Suspend ', done: 'suspended' },
  reactivate: { prefix: 'Reactivate ', done: 'reactivated' },
  revoke: { prefix: 'Revoke invitation for ', done: 'invitation revoked' },
};

/** Suspend / Reactivate / Revoke invitation. Suspend loads the impact preview first; all need a reason. */
export function AgentStatusModal({ id, action, onClose }) {
  const member = useTeamStore((s) => s.members.find((m) => m.id === id));
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    if (action !== 'suspend') return undefined;
    let live = true;
    suspendPreviewRequest(id)
      .then((d) => live && setPreview(d))
      .catch((e) => live && setPreviewError(e.message));
    return () => { live = false; };
  }, [id, action]);

  if (!member) return null;
  const { suspend, reactivate, revokeInvite } = useTeamStore.getState();
  const run = { suspend, reactivate, revoke: revokeInvite }[action];

  return (
    <FormModal
      title={ACTIONS[action].prefix + member.name}
      submitLabel="Confirm"
      successMessage={`${member.name}: ${ACTIONS[action].done}.`}
      submitDisabled={action === 'suspend' && !preview}
      onClose={onClose}
      onSubmit={(p) => run(member.id, p.reason.trim())}
    >
      {action === 'suspend' && (
        previewError ? (
          <p role="alert" className="my-2 text-danger">{previewError}</p>
        ) : preview ? (
          <KeyValueList
            items={{
              'Return to lead pool': preview.returnToPool,
              'Move to admin review': preview.moveToAdminReview,
              'Closed clients retained': preview.closedClientsRetained,
            }}
          />
        ) : (
          <p className="my-2 text-muted">Checking impact…</p>
        )
      )}
      {action === 'suspend' && <p className="my-2 text-muted">The user is signed out immediately.</p>}
      <TextAreaField label="Reason" name="reason" maxLength={1200} />
    </FormModal>
  );
}

export function CancelTransferModal({ id, onClose }) {
  const { cancelTransfer } = useAdminStore();
  return (
    <FormModal title="Cancel handoff" submitLabel="Cancel request" onClose={onClose} onSubmit={(p) => cancelTransfer({ id, note: p.note })}>
      <TextAreaField label="Reason" />
    </FormModal>
  );
}
