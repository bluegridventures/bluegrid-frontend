import { PageHeader, Panel, Table, Button } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { fmtZone, money } from '../../../utils/utils';

export default function SubscriptionLedger() {
  const { platformName, ledger, zone } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader
        eyebrow={platformName}
        title="Subscription ledger"
        subtitle="Record manual setup fees and recurring subscription payments."
        actions={<Button variant="primary" onClick={() => open('ledger')}>Record entry</Button>}
      />
      <Panel title="Billing entries">
        <Table
          columns={[
            { header: 'Company', key: 'company' },
            { header: 'Type', key: 'kind' },
            { header: 'Amount', cell: (e) => money(e.amount) },
            { header: 'Recorded', cell: (e) => fmtZone(e.at, zone) },
            { header: 'Reference', key: 'ref' },
          ]}
          rows={ledger}
        />
      </Panel>
      {modals}
    </>
  );
}
