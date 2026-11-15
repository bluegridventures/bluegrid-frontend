import { Modal, Button, Table, StatusBadge, ProviderCell, KeyValueList } from '../../shared';
import AuditTable from '../AuditTable';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed } from '../../../store/features/admin/adminFns';
import { agentName, countEvents, fmtZone } from '../../../utils/utils';

export function LeadDetailModal({ id, onClose, open }) {
  const { leads, agents, events, zone } = useAdminStore();
  const l = leads.find((x) => x.id === Number(id));
  if (!l) return null;
  return (
    <Modal title={l.name} onClose={onClose}>
      <KeyValueList
        items={{
          NPI: l.npi,
          Specialty: l.specialty,
          'Practice phone': l.phone,
          State: l.state,
          Score: l.score,
          Owner: agentName(agents, l.owner),
          Stage: l.stage,
          'Next follow-up': fmtZone(l.due, zone),
        }}
      />
      {!isFixed(l) && <Button className="mt-3" onClick={() => open('assign', l.id)}>Reassign lead</Button>}
      <h3 className="mt-4 text-[15px] font-semibold">Lead history</h3>
      <AuditTable events={events.filter((e) => e.lead === l.id)} />
    </Modal>
  );
}

export function AgentDetailModal({ id, onClose, open }) {
  const { leads, agents, events } = useAdminStore();
  const m = agents.find((a) => a.id === Number(id));
  if (!m) return null;
  const mine = leads.filter((l) => l.owner === m.id && !isFixed(l));
  const v = countEvents(events.filter((e) => e.agent === m.id));
  return (
    <Modal title={m.name} onClose={onClose}>
      <KeyValueList
        items={{
          'Work email': m.email,
          Role: m.role,
          Status: m.status,
          'Hourly claim limit': m.quota,
          'All-time dials': v[0],
          'Connected calls': v[1],
        }}
      />
      <Button className="mt-3" onClick={() => open('editAgent', m.id)}>Edit profile</Button>
      <h3 className="mt-4 text-[15px] font-semibold">Assigned leads</h3>
      <Table
        columns={[
          { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
          { header: 'Stage', cell: (l) => <StatusBadge label={l.stage} /> },
        ]}
        rows={mine}
      />
      <h3 className="mt-4 text-[15px] font-semibold">Activity</h3>
      <AuditTable events={events.filter((e) => e.agent === m.id)} onOpenLead={(lid) => open('lead', lid)} />
    </Modal>
  );
}
