import { PageHeader, Panel, Button, KeyValueList } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { showToast } from '../../../components/shared';

export default function Settings() {
  const { name, zone, quota } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader eyebrow={name} title="Company settings" subtitle="Configure the workspace and defaults for new sales users." />
      <Panel title="Workspace" actions={<Button onClick={() => open('settings')}>Edit settings</Button>}>
        <KeyValueList items={{ 'Company name': name, 'Reporting timezone': zone, 'Default hourly claim limit': quota, 'Week starts': 'Monday' }} />
      </Panel>
      <Panel title="Demo data">
        <p className="mb-3 text-muted">Clears everything saved in this browser (published NPPES leads, calls, claims) and restores the starting sample data.</p>
        <Button
          onClick={() => {
            if (!window.confirm('Reset all demo data in this browser?')) return;
            useAdminStore.getState().resetDemo();
            useBdeStore.getState().resetDemo();
            showToast('Demo data reset.');
          }}
        >
          Reset demo data
        </Button>
      </Panel>
      {modals}
    </>
  );
}
