import { PageHeader, Panel, Table, StatusBadge } from '../../../components/shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { fmtZone, HOUR, now } from '../../../utils/utils';

const SERVICES = ['Web application', 'PostgreSQL', 'Background worker', 'Encrypted backup'];

export default function Health() {
  const { platformName, zone } = useAdminStore();
  const rows = SERVICES.map((service, i) => ({ service, status: i === 3 ? 'Backup completed' : 'Healthy', at: now() - (i + 1) * HOUR }));
  return (
    <>
      <PageHeader eyebrow={platformName} title="System health" subtitle="Example infrastructure readings for the platform operator." />
      <Panel title="Sample service checks">
        <Table
          columns={[
            { header: 'Service', key: 'service' },
            { header: 'Demo status', cell: (r) => <StatusBadge label={r.status} /> },
            { header: 'Last check', cell: (r) => fmtZone(r.at, zone) },
          ]}
          rows={rows}
          rowKey={(r) => r.service}
        />
      </Panel>
    </>
  );
}
