import { useEffect, useState } from 'react';
import { FormModal, Modal, Button, Field, SelectField, CheckboxGroup, KeyValueList, Table, showToast } from '../../shared';
import { listZipEntries, isNpiDataEntry } from '../../../utils/zip';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { SPECIALTIES } from '../../../utils/data';
import { useNppesStore } from '../../../store/features/nppes/useNppesStore';
import { applyRules } from '../../../store/features/nppes/nppesFns';
import { publishBatchToPool } from '../../../store/features/nppes/nppesActions';

export function RulesModal({ onClose }) {
  const { rules, saveRules } = useAdminStore();
  return (
    <FormModal title="Publication rules" onClose={onClose} onSubmit={saveRules} arrays={['spec']}>
      <CheckboxGroup legend="Allow specialties" name="spec" options={SPECIALTIES} checked={rules.allow} />
      <Field label="Minimum score" name="min" type="number" defaultValue={rules.min} min="0" max="100" />
    </FormModal>
  );
}

export function PrepareBatchModal({ onClose, open }) {
  const { rules, prepareBatch } = useAdminStore();
  const { status, meta, providers, error, load } = useNppesStore();
  useEffect(() => { load(); }, [load]);
  const states = ['All states', ...[...new Set(providers.map((p) => p.state))].sort()];

  return (
    <FormModal
      title="Prepare import preview"
      submitLabel="Generate preview"
      onClose={onClose}
      onSubmit={(p) => {
        if (status !== 'ready') throw Error('The weekly file is not loaded yet.');
        const r = applyRules(providers, rules, { state: p.state, limit: Number(p.limit) });
        if (!r.rows.length) throw Error('No providers match the current publication rules and filters.');
        const id = prepareBatch({
          name: p.name, kind: p.kind, source: meta.source, period: meta.period, state: p.state,
          rows: r.rows, total: meta.totals.rows, inScope: r.inScope, passing: r.passing,
        });
        open('batch', id);
        return false;
      }}
    >
      {(status === 'loading' || status === 'idle') && <p className="my-2 text-muted">Loading weekly NPPES file…</p>}
      {status === 'importing' && <p className="my-2 text-muted">Importing weekly file… {useNppesStore.getState().progress}%</p>}
      {(status === 'empty' || status === 'error') && (
        <div className="my-2 rounded-md border border-line bg-warn-bg p-3">
          <p className="text-warn">{error || 'No weekly NPPES file is loaded yet.'}</p>
          <Button className="mt-2" onClick={() => open('zip')}>Import weekly ZIP</Button>
        </div>
      )}
      {status === 'ready' && (
        <KeyValueList
          items={{
            'Weekly file': meta.source,
            'Loaded from': meta.uploadedFile || 'built-in demo file',
            Period: meta.period,
            'Records in file': meta.totals.rows.toLocaleString(),
            'Behavioral-health providers with a US phone': providers.length.toLocaleString(),
            'Specialty allowlist': rules.allow.join(', '),
            'Minimum score': rules.min,
          }}
        />
      )}
      <Field key={meta?.period} label="Batch label" name="name" defaultValue={meta ? `Weekly NPPES ${meta.period}` : 'Weekly provider update'} />
      <SelectField label="Source type" name="kind" options={['Weekly increment', 'Monthly baseline']} />
      <SelectField label="State filter" name="state" options={states} />
      <Field label="Maximum providers to publish" name="limit" type="number" defaultValue={300} min="1" max="1000" />
      <p className="my-2 text-muted">Highest-scoring providers are published first. Edit the allowlist and minimum score under “Edit rules”.</p>
    </FormModal>
  );
}

export function BatchPreviewModal({ id, onClose }) {
  const { imports } = useAdminStore();
  const b = imports.find((x) => x.id === Number(id));
  if (!b) return null;
  const published = b.status === 'Published';
  return (
    <FormModal
      title="Batch preview"
      submitLabel={published ? 'Close' : `Publish ${b.rows.length} providers to the lead pool`}
      successMessage={published ? '' : 'Batch published — leads are now in the BDE Lead Pool.'}
      onClose={onClose}
      onSubmit={() => {
        if (!published) publishBatchToPool(b.id);
      }}
    >
      <KeyValueList
        items={{
          'Batch label': b.name,
          Source: b.source || b.kind,
          Period: b.period,
          'Records in file': b.total,
          'Behavioral health with US phone': b.inScope ?? '—',
          'Match your rules': b.passing ?? b.rows.length,
          'Queued for publish': b.rows.length,
          Status: b.status,
        }}
      />
      <Table
        columns={[
          { header: 'Provider', key: 'name' },
          { header: 'NPI', key: 'npi' },
          { header: 'Specialty', key: 'specialty' },
          { header: 'State', key: 'state' },
          { header: 'Phone', key: 'phone' },
          { header: 'Score', key: 'score' },
        ]}
        rows={b.rows.slice(0, 25)}
        rowKey={(r) => r.npi}
      />
      {b.rows.length > 25 && <p className="my-2 text-muted">Showing the first 25 of {b.rows.length}.</p>}
      {published && <p className="my-2">Published providers are visible in Lead Management and the BDE Lead Pool.</p>}
    </FormModal>
  );
}

/** Pick the weekly NPPES ZIP → list its files → import it into the app (parsed in the browser, saved on this device). */
export function ZipInspectModal({ onClose }) {
  const { status, progress, importZip } = useNppesStore();
  const [info, setInfo] = useState({ state: 'idle' });
  const [error, setError] = useState('');
  const importing = status === 'importing';

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setInfo({ state: 'loading' });
    try {
      const entries = await listZipEntries(file);
      setInfo({ state: 'done', file, entries });
    } catch (err) {
      setInfo({ state: 'error', message: err.message });
    }
  };

  const doImport = async () => {
    setError('');
    try {
      const { providers } = await importZip(info.file);
      showToast(`Weekly file imported — ${providers.length.toLocaleString()} providers ready.`);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const hasData = info.state === 'done' && info.entries.some(isNpiDataEntry);
  return (
    <Modal title="Import weekly NPPES ZIP" onClose={onClose}>
      <p className="my-2 text-muted">
        Choose the weekly CMS download (e.g. npi_weekly_20261102_20261108.zip). It is read and filtered in your browser and saved on this
        device, so it is still here after a refresh. Nothing is uploaded to a server.
      </p>
      <label className="my-2.5 grid gap-1 font-semibold">
        CMS ZIP file
        <input type="file" accept=".zip" onChange={onFile} disabled={importing} className="rounded-md border border-field bg-white px-2.5 py-2" />
      </label>
      <div role="status">
        {info.state === 'loading' && 'Reading archive directory…'}
        {info.state === 'error' && <p className="text-danger">{info.message}</p>}
        {info.state === 'done' && (
          <>
            <KeyValueList items={{ 'Selected file': info.file.name, 'Archive entries': info.entries.length }} />
            <Table
              columns={[
                { header: 'Entry name', key: 'name' },
                { header: 'Uncompressed size', cell: (e) => Math.ceil(e.size / 1024).toLocaleString() + ' KB' },
              ]}
              rows={info.entries}
              rowKey={(e) => e.name}
            />
            {hasData ? (
              <div className="my-3 flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={doImport} disabled={importing}>
                  {importing ? `Importing… ${progress}%` : 'Import into app'}
                </Button>
                {importing && <span className="text-muted">Large file — this takes a few seconds.</span>}
              </div>
            ) : (
              <p className="my-3 text-danger">npidata_pfile_*.csv was not found in this ZIP, so it cannot be imported.</p>
            )}
          </>
        )}
        {error && <p className="my-2 text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
