import { PageHeader, Panel, Button, KeyValueList } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function PlatformSettings() {
  const platformName = useAdminStore((s) => s.platformName);
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader eyebrow={platformName} title="Platform settings" subtitle="Manage the platform display identity." />
      <Panel title="Platform identity" actions={<Button onClick={() => open('platformSettings')}>Edit</Button>}>
        <KeyValueList items={{ 'Display name': platformName, 'Billing currency': 'USD' }} />
      </Panel>
      {modals}
    </>
  );
}
