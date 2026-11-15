import { PageHeader, Panel, Table, Button, StatusBadge, ProviderCell } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { agentName, fmtZone } from '../../../utils/utils';

export default function Appointments() {
  const { name, meetings, leads, agents, zone } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader
        eyebrow={name}
        title="Appointments"
        subtitle="Review scheduled meetings, participants and outcomes."
        actions={<Button variant="primary" onClick={() => open('newMeeting')}>Schedule meeting</Button>}
      />
      <Panel title="Company appointments">
        <Table
          columns={[
            {
              header: 'Provider',
              cell: (m) => {
                const l = leads.find((x) => x.id === m.lead);
                return <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} />;
              },
            },
            { header: 'Scheduled time', cell: (m) => fmtZone(m.at, zone) },
            { header: 'Organizer', cell: (m) => agentName(agents, m.owner) },
            { header: 'Participants', key: 'participants' },
            { header: 'Status', cell: (m) => <StatusBadge label={m.status} /> },
            { header: 'Actions', cell: (m) => <Button onClick={() => open('meeting', m.id)}>Manage</Button> },
          ]}
          rows={meetings}
          rowKey={(m) => m.id}
        />
      </Panel>
      {modals}
    </>
  );
}
