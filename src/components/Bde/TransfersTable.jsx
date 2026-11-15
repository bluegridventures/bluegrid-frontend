import { PageHeader, Panel, Table, Button, StatusBadge, ProviderCell } from '../shared';
import { useLeadModals } from './LeadModals';
import { useBdeStore } from '../../store/features/bde/useBdeStore';
import { isPending } from '../../store/features/bde/bdeFns';
import { BDE_USER } from '../../store/constant';

/** "Incoming Transfers" (incoming) and "Transferred Leads" (outgoing). */
export default function TransfersTable({ incoming }) {
  const leads = useBdeStore((s) => s.leads);
  const { open, modals } = useLeadModals();
  const rows = leads.filter((l) => (incoming ? l.transfer?.to === BDE_USER : l.transfer?.from === BDE_USER));

  return (
    <>
      <PageHeader
        title={incoming ? 'Incoming Transfers' : 'Transferred Leads'}
        subtitle={incoming ? 'Review handoffs assigned to you.' : 'Track handoff decisions and provider progress.'}
      />
      <Panel>
        <Table
          columns={[
            { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: incoming ? 'From' : 'To', cell: (l) => (incoming ? l.transfer.from : l.transfer.to) },
            { header: 'Handoff reason', cell: (l) => l.transfer.reason },
            { header: 'Transfer', cell: (l) => <StatusBadge label={l.transfer.state} tone="default" /> },
            { header: 'Lead stage', cell: (l) => <StatusBadge label={l.status} tone="default" /> },
            {
              header: 'Actions',
              cell: (l) =>
                isPending(l) ? (
                  incoming ? (
                    <span className="inline-flex gap-2">
                      <Button variant="primary" onClick={() => open('accept', l.id)}>Accept</Button>
                      <Button onClick={() => open('reject', l.id)}>Reject</Button>
                    </span>
                  ) : (
                    <Button onClick={() => open('cancel', l.id)}>Cancel request</Button>
                  )
                ) : (
                  <Button onClick={() => open('lead', l.id)}>View history</Button>
                ),
            },
          ]}
          rows={rows}
          rowKey={(l) => l.id}
          empty="No records match this view."
        />
      </Panel>
      {modals}
    </>
  );
}
