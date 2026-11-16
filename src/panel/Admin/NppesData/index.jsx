import { PageHeader, Panel, Table, Button, StatusBadge, KeyValueList, EmptyState } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useEffect } from 'react';
import { useNppesStore } from '../../../store/features/nppes/useNppesStore';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function NppesData() {
  const { name, rules, imports } = useAdminStore();
  const { open, modals } = useAdminModals();
  const { status, meta, providers, load, clear } = useNppesStore();
  useEffect(() => { load(); }, [load]);
  return (
    <>
      <PageHeader
        eyebrow={name}
        title="NPPES data"
        subtitle="Preview a sample CMS batch, review eligibility, then publish approved providers."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => open('zip')}>Import weekly ZIP</Button>
            <Button variant="primary" onClick={() => open('prepare')}>Prepare sample batch</Button>
          </div>
        }
      />
      <Panel
        title="Weekly source file"
        actions={status === 'ready' && <Button onClick={() => { if (window.confirm('Remove the imported weekly file from this browser?')) clear(); }}>Remove file</Button>}
      >
        {status === 'ready' ? (
          <KeyValueList
            items={{
              File: meta.source,
              'Loaded from': meta.uploadedFile || 'built-in demo file',
              Period: meta.period,
              'Records in file': meta.totals.rows.toLocaleString(),
              'Behavioral-health providers with a US phone': providers.length.toLocaleString(),
            }}
          />
        ) : (
          <EmptyState>{status === 'importing' ? 'Importing…' : status === 'empty' ? 'No weekly file loaded. Click “Import weekly ZIP” and choose the npi_weekly ZIP you downloaded.' : 'Loading…'}</EmptyState>
        )}
      </Panel>
      <Panel title="Publication rules" actions={<Button onClick={() => open('rules')}>Edit rules</Button>}>
        <KeyValueList items={{ 'Allowed specialties': rules.allow.join(', '), 'Minimum score': rules.min }} />
      </Panel>
      <Panel title="Import history">
        {imports.length ? (
          <Table
            columns={[
              { header: 'Batch', key: 'name' },
              { header: 'Type', key: 'kind' },
              { header: 'Source', cell: (b) => b.source || 'Sample fixture' },
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
