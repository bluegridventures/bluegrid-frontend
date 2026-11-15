import { PageHeader, Panel, Table, Button, StatusBadge, ProviderCell } from '../../../components/shared';
import { useLeadModals } from '../../../components/Bde/LeadModals';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { isOwned } from '../../../store/features/bde/bdeFns';
import { fmtLocal } from '../../../utils/utils';

export default function Appointments() {
  const leads = useBdeStore((s) => s.leads);
  const { open, modals } = useLeadModals();
  return (
    <>
      <PageHeader title="Appointments" subtitle="Manage meeting confirmations, outcomes and BAA progress." />
      <Panel>
        <Table
          columns={[
            { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: 'Meeting time', cell: (l) => fmtLocal(l.appt.at) },
            { header: 'Services', cell: (l) => l.services.join(', ') },
            { header: 'Meeting status', cell: (l) => <StatusBadge label={l.appt.status} tone="default" /> },
            { header: 'Sales stage', cell: (l) => <StatusBadge label={l.status} tone="default" /> },
            { header: 'Action', cell: (l) => <Button onClick={() => open('meeting', l.id)}>Manage meeting</Button> },
          ]}
          rows={leads.filter((l) => l.appt && isOwned(l))}
          rowKey={(l) => l.id}
          empty="No records match this view."
        />
      </Panel>
      {modals}
    </>
  );
}
