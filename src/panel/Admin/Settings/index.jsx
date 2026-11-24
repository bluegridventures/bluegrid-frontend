import { useEffect } from 'react';
import { PageHeader, Panel, Button, KeyValueList, showToast } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useSettingsStore } from '../../../store/features/settings/useSettingsStore';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';

export default function Settings() {
  const { settings, isLoading, error, fetchSettings } = useSettingsStore();
  const { open, modals } = useAdminModals();
  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return (
    <>
      <PageHeader eyebrow={settings?.name} title="Company settings" subtitle="Configure the workspace and defaults for new sales users." />
      <Panel title="Workspace" actions={<Button disabled={!settings} onClick={() => open('settings')}>Edit settings</Button>}>
        {error && (
          <p role="alert" className="mb-3 text-danger">
            Could not load settings: {error} <Button variant="link" onClick={fetchSettings}>Retry</Button>
          </p>
        )}
        {settings ? (
          <>
            <KeyValueList
              items={{
                'Company name': settings.name,
                'Reporting timezone': settings.timezone,
                'Default hourly claim limit': settings.defaultClaimLimit,
                'Week starts': settings.weekStartsOn,
              }}
            />
            <p className="mt-3 text-xs text-muted">The default claim limit only applies to users created from now on.</p>
          </>
        ) : (
          !error && <p className="text-muted">{isLoading ? 'Loading settings…' : ''}</p>
        )}
      </Panel>
      <Panel title="Demo data">
        <p className="mb-3 text-muted">Clears everything saved in this browser (published NPPES leads, calls, claims) and restores the starting sample data. Your account and team are not affected.</p>
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
