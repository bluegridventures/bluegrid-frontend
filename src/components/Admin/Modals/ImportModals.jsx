import { useState } from 'react';
import { FormModal, Modal, Field, SelectField, CheckboxGroup, KeyValueList, Table } from '../../shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { SPECIALTIES } from '../../../utils/data';

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
  return (
    <FormModal
      title="Prepare import preview"
      submitLabel="Generate preview"
      onClose={onClose}
      onSubmit={(p) => {
        const id = prepareBatch(p);
        open('batch', id);
        return false;
      }}
    >
      <p className="my-2 text-muted">Use the built-in CMS-style sample to test filtering and publication. Live ZIP ingestion belongs to the backend.</p>
      <Field label="Batch label" name="name" defaultValue="Weekly provider update" />
      <SelectField label="Source type" name="kind" options={['Weekly increment', 'Monthly baseline']} />
      <KeyValueList items={{ Source: 'Built-in sample · four synthetic providers', 'Specialty allowlist': rules.allow.join(', '), 'Minimum score': rules.min }} />
    </FormModal>
  );
}

export function BatchPreviewModal({ id, onClose }) {
  const { imports, publishBatch } = useAdminStore();
  const b = imports.find((x) => x.id === Number(id));
  if (!b) return null;
  const published = b.status === 'Published';
  return (
    <FormModal
      title="Batch preview"
      submitLabel={published ? 'Close' : 'Publish eligible providers'}
      successMessage={published ? '' : 'Demo workspace updated.'}
      onClose={onClose}
      onSubmit={() => {
        if (!published) publishBatch({ id: b.id });
      }}
    >
      <KeyValueList
        items={{
          'Batch label': b.name,
          Source: b.kind,
          'Sample rows': b.total,
          Eligible: b.rows.length,
          'Excluded by rules': b.total - b.rows.length,
          Status: b.status,
        }}
      />
      <Table
        columns={[
          { header: 'Provider', key: 'name' },
          { header: 'NPI', key: 'npi' },
          { header: 'Specialty', key: 'specialty' },
          { header: 'Score', key: 'score' },
        ]}
        rows={b.rows}
      />
      {published && <p className="my-2">Published providers are visible in Lead Management.</p>}
    </FormModal>
  );
}

/** Reads only the ZIP central directory in the browser to list entries — no upload. */
async function readZipEntries(file) {
  const tail = new Uint8Array(await file.slice(-65557).arrayBuffer());
  const v = new DataView(tail.buffer);
  let end = tail.length - 22;
  while (end >= 0 && (v.getUint32(end, true) !== 0x06054b50 || end + 22 + v.getUint16(end + 20, true) !== tail.length)) end--;
  if (end < 0) throw Error('ZIP directory could not be found.');
  const offset = v.getUint32(end + 16, true);
  const size = v.getUint32(end + 12, true);
  const count = v.getUint16(end + 10, true);
  if (count > 300 || size > 3000000 || offset + size > file.size) throw Error('This archive requires the backend importer.');
  const buf = await file.slice(offset, offset + size).arrayBuffer();
  const dv = new DataView(buf);
  const entries = [];
  let pos = 0;
  for (let i = 0; i < count; i++) {
    if (pos + 46 > size || dv.getUint32(pos, true) !== 0x02014b50) throw Error('Invalid ZIP directory.');
    const n = dv.getUint16(pos + 28, true);
    const extra = dv.getUint16(pos + 30, true);
    const comment = dv.getUint16(pos + 32, true);
    if (pos + 46 + n + extra + comment > size) throw Error('Invalid filename entry.');
    entries.push({ name: new TextDecoder().decode(new Uint8Array(buf, pos + 46, n)), size: Math.ceil(dv.getUint32(pos + 24, true) / 1024) + ' KB' });
    pos += 46 + n + extra + comment;
  }
  return { count, entries };
}

export function ZipInspectModal({ onClose }) {
  const [state, setState] = useState({ status: 'idle' });
  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setState({ status: 'loading' });
    try {
      setState({ status: 'done', file: file.name, ...(await readZipEntries(file)) });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };
  return (
    <Modal title="Inspect local NPPES ZIP" onClose={onClose}>
      <p className="my-2 text-muted">
        Select a local CMS archive to inspect its file list. The preview reads metadata on your device. CSV validation and live
        publication require the backend importer.
      </p>
      <label className="my-2.5 grid gap-1 font-semibold">
        CMS ZIP file
        <input type="file" accept=".zip" onChange={onFile} className="rounded-md border border-field bg-white px-2.5 py-2" />
      </label>
      <div role="status">
        {state.status === 'loading' && 'Reading archive directory…'}
        {state.status === 'error' && state.message}
        {state.status === 'done' && (
          <>
            <KeyValueList items={{ 'Selected file': state.file, 'Archive entries': state.count }} />
            <Table columns={[{ header: 'Entry name', key: 'name' }, { header: 'Uncompressed size', key: 'size' }]} rows={state.entries} />
          </>
        )}
      </div>
    </Modal>
  );
}
