import { PageHeader, Panel, Table, Button } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { money } from '../../../utils/utils';

export default function Plans() {
  const { platformName, plans } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader
        eyebrow={platformName}
        title="Plans"
        subtitle="Configure one-time setup and monthly subscription fees."
        actions={<Button variant="primary" onClick={() => open('plan', '')}>Add plan</Button>}
      />
      <Panel title="Subscription plans">
        <Table
          columns={[
            { header: 'Plan', key: 'name' },
            { header: 'Setup fee', cell: (p) => money(p.setup) },
            { header: 'Monthly fee', cell: (p) => money(p.monthly) },
            { header: 'Action', cell: (p) => <Button onClick={() => open('plan', plans.indexOf(p))}>Edit</Button> },
          ]}
          rows={plans}
          rowKey={(p) => p.name}
        />
      </Panel>
      {modals}
    </>
  );
}
