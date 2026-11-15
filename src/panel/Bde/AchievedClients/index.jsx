import { PageHeader, Panel, Table, StatusBadge, ProviderCell } from '../../../components/shared';
import { useLeadModals } from '../../../components/Bde/LeadModals';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { BDE_USER } from '../../../store/constant';
import { fmtLocal } from '../../../utils/utils';

export default function AchievedClients() {
  const leads = useBdeStore((s) => s.leads);
  const { open, modals } = useLeadModals();
  return (
    <>
      <PageHeader title="Achieved Clients" subtitle="Your closed-won providers and signed BAA dates." />
      <Panel>
        <Table
          columns={[
            { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: 'BAA signed', cell: (l) => fmtLocal(l.achieved) },
            { header: 'Services', cell: (l) => l.services.join(', ') },
            { header: 'Credited to', key: 'owner' },
            { header: 'Status', cell: () => <StatusBadge label="Closed won" tone="default" /> },
          ]}
          rows={leads.filter((l) => l.achieved && l.owner === BDE_USER)}
          rowKey={(l) => l.id}
          empty="No records match this view."
        />
      </Panel>
      {modals}
    </>
  );
}
