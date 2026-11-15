import { PageHeader, Panel, Table } from '../../../components/shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function Imports() {
  const { platformName, imports } = useAdminStore();
  return (
    <>
      <PageHeader eyebrow={platformName} title="Import catalog" subtitle="Platform-level source inventory and sample batch metadata." />
      <Panel title="Source catalog">
        <Table
          columns={[
            { header: 'Batch', key: 'name' },
            { header: 'Source type', key: 'kind' },
            { header: 'Source rows', key: 'total' },
            { header: 'Format verification', cell: () => 'Synthetic fixture only' },
          ]}
          rows={imports}
          rowKey={(b) => b.id}
        />
      </Panel>
    </>
  );
}
