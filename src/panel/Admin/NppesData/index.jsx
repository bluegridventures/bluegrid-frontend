import { PageHeader, Panel, Table, Button, StatusBadge, KeyValueList, EmptyState } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function NppesData() {
  const { name, rules, imports } = useAdminStore();
  const { open, modals } = useAdminModals();
  return (
    <>
      <PageHeader
        eyebrow={name}
        title="NPPES data"
        subtitle="Preview a sample CMS batch, review eligibility, then publish approved providers."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => open('zip')}>Inspect local ZIP</Button>
            <Button variant="primary" onClick={() => open('prepare')}>Prepare sample batch</Button>
          </div>
        }
      />
      <Panel title="Publication rules" actions={<Button onClick={() => open('rules')}>Edit rules</Button>}>
        <KeyValueList items={{ 'Allowed specialties': rules.allow.join(', '), 'Minimum score': rules.min }} />
      </Panel>
      <Panel title="Import history">
        {imports.length ? (
          <Table
            columns={[
              { header: 'Batch', key: 'name' },
              { header: 'Type', key: 'kind' },
              { header: 'Source', cell: () => 'Sample fixture' },
              { header: 'Eligible', cell: (b) => b.rows.length },
              { header: 'Status', cell: (b) => <StatusBadge label={b.status} /> },
              { header: 'Action', cell: (b) => <Button onClick={() => open('batch', b.id)}>Review</Button> },
            ]}
            rows={imports}
            rowKey={(b) => b.id}
          />
        ) : (
          <EmptyState>Prepare the first sample batch to review its providers.</EmptyState>
        )}
      </Panel>
      {modals}
    </>
  );
}
