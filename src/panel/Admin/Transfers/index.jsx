import { PageHeader, Panel, Table, Button, StatusBadge, ProviderCell } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { agentName } from '../../../utils/utils';

export default function Transfers() {
  const { name, transfers, leads, agents } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader eyebrow={name} title="Transfers" subtitle="Monitor handoffs and intervene when ownership needs to change." />
      <Panel title="Transfer requests">
        <Table
          columns={[
            {
              header: 'Provider',
              cell: (t) => {
                const l = leads.find((x) => x.id === t.lead);
                return <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} />;
              },
            },
            { header: 'Sender', cell: (t) => agentName(agents, t.from) },
            { header: 'Recipient', cell: (t) => agentName(agents, t.to) },
            { header: 'Status', cell: (t) => <StatusBadge label={t.status} /> },
            { header: 'Reason', key: 'reason' },
            {
              header: 'Actions',
              cell: (t) =>
                t.status === 'Pending' ? (
                  <span className="inline-flex gap-2">
                    <Button onClick={() => open('assign', t.lead)}>Reassign directly</Button>
                    <Button onClick={() => open('cancelTransfer', t.id)}>Cancel request</Button>
                  </span>
                ) : (
                  'Resolved'
                ),
            },
          ]}
          rows={transfers}
          rowKey={(t) => t.id}
        />
      </Panel>
      {modals}
    </>
  );
}
