import { FormModal, Field, SelectField, TextAreaField, FormRow, Table, KeyValueList } from '../../shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed, isWarm } from '../../../store/features/admin/adminFns';
import { AGENT_ROLES } from '../../../utils/data';
import { agentName } from '../../../utils/utils';

export function ReassignModal({ ids, onClose }) {
  const { leads, agents, reassignLeads } = useAdminStore();
  const eligible = ids.map((id) => leads.find((l) => l.id === id)).filter((l) => l && !isFixed(l));
  const active = agents.filter((a) => a.status === 'Active');
  return (
    <FormModal
      title="Preview reassignment"
      submitLabel="Confirm reassignment"
      onClose={onClose}
      onSubmit={(p) => {
        if (!eligible.length) throw Error('Select an eligible lead first.');
        reassignLeads({ ids: eligible.map((l) => l.id), owner: p.owner, note: p.note });
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
      <SelectField label="New owner" name="owner" placeholder="Select team member" options={active.map((a) => ({ value: a.id, label: a.name }))} />
      <TextAreaField label="Reason" />
    </FormModal>
  );
}

export function AgentFormModal({ id, onClose }) {
  const { agents, quota, saveAgent } = useAdminStore();
  const a = id ? agents.find((x) => x.id === Number(id)) : null;
  return (
    <FormModal
      title={a ? 'Edit agent' : 'Create agent'}
      submitLabel={a ? 'Save changes' : 'Create invitation'}
      onClose={onClose}
      onSubmit={(p) => saveAgent({ ...p, id: a?.id })}
    >
      <Field label="Full name" name="name" defaultValue={a?.name} />
      <Field label="Work email" name="email" type="email" defaultValue={a?.email} />
      <Field label="Phone (optional)" name="phone" type="tel" defaultValue={a?.phone} required={false} />
      <FormRow>
        <SelectField label="Role" name="role" options={AGENT_ROLES} defaultValue={a?.role} />
        <Field label="Hourly claim limit" name="quota" type="number" defaultValue={a?.quota ?? quota} min="1" max="500" />
      </FormRow>
      {!a && <p className="my-2 text-muted">Creates a demo invitation. Delivery and account activation require the live application.</p>}
    </FormModal>
  );
}

export function AgentStatusModal({ id, action, onClose }) {
  const { agents, leads, clients, changeAgentStatus } = useAdminStore();
  const m = agents.find((a) => a.id === Number(id));
  const mine = leads.filter((l) => l.owner === m.id && !isFixed(l));
  const prefix = action === 'suspend' ? 'Suspend ' : action === 'revoke' ? 'Revoke invitation for ' : 'Reactivate ';
  return (
    <FormModal title={prefix + m.name} submitLabel="Confirm" onClose={onClose} onSubmit={(p) => changeAgentStatus({ id: m.id, action, note: p.note })}>
      {action === 'suspend' && (
        <KeyValueList
          items={{
            'Return to lead pool': mine.filter((l) => !isWarm(l)).length,
            'Move to admin review': mine.filter(isWarm).length,
            'Closed clients retained': clients.filter((c) => leads.find((l) => l.id === c.lead)?.owner === m.id).length,
          }}
        />
      )}
      <TextAreaField label="Reason" />
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
