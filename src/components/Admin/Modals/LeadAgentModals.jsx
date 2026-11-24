import { Modal, Button, Table, StatusBadge, ProviderCell, KeyValueList } from '../../shared';
import AuditTable from '../AuditTable';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed } from '../../../store/features/admin/adminFns';
import { useTeamStore } from '../../../store/features/team/useTeamStore';
import { ROLE_LABELS } from '../../../store/constant';
import { agentName, countEvents, fmtDate, fmtZone } from '../../../utils/utils';

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

/**
 * Profile header comes from the real team API (store). Leads, dials and activity are still demo data:
 * they are matched to a demo agent by name until the profile / Leads APIs exist.
 */
export function AgentDetailModal({ id, onClose, open }) {
  const { leads, agents, events } = useAdminStore();
  const member = useTeamStore((s) => s.members.find((x) => x.id === id));
  if (!member) return null;
  const lower = member.name.toLowerCase();
  const m = agents.find((a) => lower === a.name.toLowerCase() || lower.startsWith(`${a.name.toLowerCase()} `));
  const mine = m ? leads.filter((l) => l.owner === m.id && !isFixed(l)) : [];
  const mineEvents = m ? events.filter((e) => e.agent === m.id) : [];
  const v = countEvents(mineEvents);
  return (
    <Modal title={member.name} onClose={onClose}>
      <KeyValueList
        items={{
          'Work email': member.email,
          Phone: member.phone,
          Role: ROLE_LABELS[member.role] || member.role,
          Status: member.status,
          'Hourly claim limit': member.claimLimitPerHour,
          'Last login': member.lastLoginAt ? fmtDate(member.lastLoginAt) : '',
          'All-time dials (demo)': v[0],
          'Connected calls (demo)': v[1],
        }}
      />
      {member.status !== 'Revoked' && <Button className="mt-3" onClick={() => open('editAgent', member.id)}>Edit profile</Button>}
      <h3 className="mt-4 text-[15px] font-semibold">Assigned leads (demo)</h3>
      <Table
        columns={[
          { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
          { header: 'Stage', cell: (l) => <StatusBadge label={l.stage} /> },
        ]}
        rows={mine}
      />
      <h3 className="mt-4 text-[15px] font-semibold">Activity (demo)</h3>
      <AuditTable events={mineEvents} onOpenLead={(lid) => open('lead', lid)} />
    </Modal>
  );
}
