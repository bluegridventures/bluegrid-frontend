import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Panel, Table, Button, SearchBar, FilterDropdown, StatusBadge, ProviderCell, ErrorBanner, Pagination, showToast } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { useAdminLeadsStore } from '../../../store/features/leads/useAdminLeadsStore';
import { LEAD_STAGES } from '../../../store/constant';
import useDebounce from '../../../utils/hooks/useDebounce';

const STAGE_OPTIONS = [{ value: '', label: 'All stages' }, ...LEAD_STAGES.map((s) => ({ value: s, label: s }))];

// TODO(step 5): Reassign / Reassign selected need the reassignment API. Until then they only explain that.
const reassignPending = () => showToast('Reassignment is connected in a later backend step.');

export default function LeadManagement() {
  const tenantName = useAuthStore((s) => s.user?.tenant?.name);
  const { items, meta, filters, isLoading, hasLoaded, error, setFilters, setPage, fetch } = useAdminLeadsStore();
  const { open, modals } = useAdminModals();
  const [params, setParams] = useSearchParams();
  const stage = params.get('stage') || ''; // the URL stays the source of truth (dashboard cards link here)
  const [search, setSearch] = useState(filters.search);
  const dSearch = useDebounce(search, 300);
  const [checked, setChecked] = useState(new Set());

  useEffect(() => {
    if (useAdminLeadsStore.getState().filters.stage !== stage) setFilters({ stage });
  }, [stage, setFilters]);
  useEffect(() => {
    if (useAdminLeadsStore.getState().filters.search !== dSearch) setFilters({ search: dSearch });
  }, [dSearch, setFilters]);
  useEffect(() => { fetch(); }, [filters, fetch]);

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      <PageHeader eyebrow={tenantName} title="Lead management" subtitle="Review ownership, suppression and the warm-lead reassignment queue." />
      <Panel title="Company leads">
        <div className="my-3 flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search provider, NPI, state or owner" label="Search leads" />
          <FilterDropdown label="Filter by stage" value={stage} onChange={(v) => setParams(v ? { stage: v } : {})} options={STAGE_OPTIONS} />
          <Button
            onClick={() => {
              if (!checked.size) return showToast('Select an eligible lead first.');
              reassignPending(); // TODO(step 5): open('bulk', [...checked])
            }}
          >
            Reassign selected ({checked.size})
          </Button>
        </div>
        <ErrorBanner message={error} onRetry={fetch} />
        <Table
          loading={isLoading}
          columns={[
            {
              header: 'Select',
              cell: (l) => <input type="checkbox" aria-label={`Select ${l.name}`} checked={checked.has(l.id)} disabled={l.protected} onChange={() => toggle(l.id)} />,
            },
            { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: 'Specialty', key: 'specialty' },
            { header: 'State', key: 'state' },
            { header: 'Score', key: 'score' },
            { header: 'Owner', cell: (l) => l.owner?.name || 'Unassigned' },
            { header: 'Stage', cell: (l) => <StatusBadge label={l.stage} /> },
            { header: 'Action', cell: (l) => (l.protected ? 'Protected' : <Button onClick={reassignPending}>Reassign</Button>) },
          ]}
          rows={items}
          rowKey={(l) => l.id}
          empty={hasLoaded || error ? 'No records match this view.' : ''}
        />
        <Pagination meta={meta} disabled={isLoading} onPage={setPage} onLimit={(limit) => setFilters({ limit })} />
      </Panel>
      {modals}
    </>
  );
}
