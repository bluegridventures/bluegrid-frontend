import { PageHeader, Panel, Button } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { TenantsTable } from '../Dashboard';

export default function Companies() {
  const platformName = useAdminStore((s) => s.platformName);
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader
        eyebrow={platformName}
        title="Companies"
        subtitle="Manage tenant accounts, plans and capacity limits."
        actions={<Button variant="primary" onClick={() => open('tenant')}>Create company</Button>}
      />
      <Panel title="Companies">
        <TenantsTable open={open} />
      </Panel>
      {modals}
    </>
  );
}
