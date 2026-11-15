import { PageHeader, Panel, Table, Button, StatusBadge, AnalyticsCard, StatGrid } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { money } from '../../../utils/utils';

export function TenantsTable({ open }) {
  const { tenants } = useAdminStore();
  return (
    <Table
      columns={[
        { header: 'Company', key: 'name' },
        { header: 'Slug', key: 'slug' },
        { header: 'Plan', key: 'plan' },
        { header: 'Seats', key: 'seats' },
        { header: 'Subscription', cell: (t) => <StatusBadge label={t.status} /> },
        { header: 'Action', cell: (t) => <Button onClick={() => open('tenant', t.id)}>Manage</Button> },
      ]}
      rows={tenants}
      rowKey={(t) => t.id}
    />
  );
}

export default function PlatformDashboard() {
  const { platformName, tenants, plans } = useAdminStore();
  const { open, modals } = useAdminModals();
  const mrr = tenants.reduce((a, t) => a + (t.status === 'Active' ? plans.find((p) => p.name === t.plan)?.monthly || 0 : 0), 0);
  return (
    <>
      <PageHeader eyebrow={platformName} title="Platform overview" subtitle="Subscription and capacity across customer companies." />
      <StatGrid cols={5}>
        <AnalyticsCard label="Companies" value={tenants.length} />
        <AnalyticsCard label="Active" value={tenants.filter((t) => t.status === 'Active').length} />
        <AnalyticsCard label="Trial accounts" value={tenants.filter((t) => t.status === 'Trial').length} />
        <AnalyticsCard label="Allocated seats" value={tenants.reduce((a, t) => a + Number(t.seats), 0)} />
        <AnalyticsCard label="Active plan MRR" value={money(mrr)} />
      </StatGrid>
      <Panel title="Client companies">
        <TenantsTable open={open} />
      </Panel>
      {modals}
    </>
  );
}
