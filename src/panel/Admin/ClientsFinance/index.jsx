import { PageHeader, Panel, Table, Button, StatusBadge, ProviderCell } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { nextStep } from '../../../store/features/admin/adminFns';
import { fmtZone, money } from '../../../utils/utils';

export default function ClientsFinance() {
  const { name, clients, leads, zone } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader eyebrow={name} title="Clients & finance" subtitle="Track each signed BAA through contract, invoice, payment and work start." />
      <Panel title="Achieved clients">
        <Table
          columns={[
            {
              header: 'Client',
              cell: (c) => {
                const l = leads.find((x) => x.id === c.lead);
                return <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} />;
              },
            },
            { header: 'BAA signed', cell: (c) => fmtZone(c.signed, zone) },
            { header: 'Contract', cell: (c) => <StatusBadge label={c.contract ? 'Sent' : 'Pending'} /> },
            { header: 'Invoice (USD)', cell: (c) => (c.invoice === null ? '—' : money(c.invoice)) },
            { header: 'Payment', cell: (c) => (c.invoice === null ? '—' : <StatusBadge label={c.paid ? 'Paid' : 'Outstanding'} />) },
            { header: 'Work', cell: (c) => (c.work ? 'Started' : 'Pending') },
            {
              header: 'Action',
              cell: (c) => {
                const step = nextStep(c);
                return step === 'Complete' ? <StatusBadge label="Complete" /> : <Button variant="primary" onClick={() => open('financial', c.lead)}>{step}</Button>;
              },
            },
          ]}
          rows={clients}
          rowKey={(c) => c.lead}
        />
      </Panel>
      {modals}
    </>
  );
}
