import { PageHeader, Panel, Button, KeyValueList } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function Settings() {
  const { name, zone, quota } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader eyebrow={name} title="Company settings" subtitle="Configure the workspace and defaults for new sales users." />
      <Panel title="Workspace" actions={<Button onClick={() => open('settings')}>Edit settings</Button>}>
        <KeyValueList items={{ 'Company name': name, 'Reporting timezone': zone, 'Default hourly claim limit': quota, 'Week starts': 'Monday' }} />
      </Panel>
      {modals}
    </>
  );
}
