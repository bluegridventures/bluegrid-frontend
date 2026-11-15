import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Panel, Table, Button, SearchBar, FilterDropdown, StatusBadge, ProviderCell, showToast } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed } from '../../../store/features/admin/adminFns';
import { agentName, matchText } from '../../../utils/utils';

export default function LeadManagement() {
  const { name, leads, agents } = useAdminStore();
  const { open, modals } = useAdminModals();
  const [params, setParams] = useSearchParams();
  const stage = params.get('stage') || 'All';
  const [q, setQ] = useState('');
  const [checked, setChecked] = useState(new Set());

  const stages = ['All', ...new Set(leads.map((l) => l.stage))];
  const rows = leads.filter(
    (l) => (stage === 'All' || l.stage === stage) && matchText([l.name, l.npi, l.state, agentName(agents, l.owner)], q),
  );
  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      <PageHeader eyebrow={name} title="Lead management" subtitle="Review ownership, suppression and the warm-lead reassignment queue." />
      <Panel title="Company leads">
        <div className="my-3 flex flex-wrap items-center gap-3">
          <SearchBar value={q} onChange={setQ} placeholder="Search provider, NPI or owner" label="Search leads" />
          <FilterDropdown
            label="Filter by stage"
            value={stage}
            onChange={(v) => setParams(v === 'All' ? {} : { stage: v })}
            options={stages}
          />
          <Button
            onClick={() => {
              if (!checked.size) return showToast('Select an eligible lead first.');
              open('bulk', [...checked]);
              setChecked(new Set());
            }}
          >
            Reassign selected ({checked.size})
          </Button>
        </div>
        <Table
          columns={[
            {
              header: 'Select',
              cell: (l) => (
                <input type="checkbox" aria-label={`Select ${l.name}`} checked={checked.has(l.id)} disabled={isFixed(l)} onChange={() => toggle(l.id)} />
              ),
            },
            { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: 'Specialty', key: 'specialty' },
            { header: 'State', key: 'state' },
            { header: 'Score', key: 'score' },
            { header: 'Owner', cell: (l) => agentName(agents, l.owner) },
            { header: 'Stage', cell: (l) => <StatusBadge label={l.stage} /> },
            { header: 'Action', cell: (l) => (isFixed(l) ? 'Protected' : <Button onClick={() => open('assign', l.id)}>Reassign</Button>) },
          ]}
          rows={rows}
          rowKey={(l) => l.id}
        />
      </Panel>
      {modals}
    </>
  );
}
