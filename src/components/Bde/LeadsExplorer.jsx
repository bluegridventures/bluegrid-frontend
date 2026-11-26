import { useEffect, useState } from 'react';
import { PageHeader, Panel, Table, Button, SearchBar, FilterDropdown, StatusBadge, ProviderCell, ErrorBanner, Pagination, showToast, fieldClass } from '../shared';
import { useLeadModals } from './LeadModals';
import { useLeadPoolStore } from '../../store/features/leads/useLeadPoolStore';
import { useMyLeadsStore } from '../../store/features/leads/useMyLeadsStore';
import { useLeadFilterOptions } from '../../store/features/leads/useLeadFiltersStore';
import { friendlyError } from '../../store/features/leads/errors';
import { fmtLocal } from '../../utils/utils';
import useDebounce from '../../utils/hooks/useDebounce';
import { providerLocalTime, quotaExhausted } from '../Leads/leadUtils';

const SORTS = [
  { value: 'score', label: 'Highest score' },
  { value: 'name', label: 'Provider A–Z' },
  { value: 'newest', label: 'Newest enumeration' },
];
const PRIORITIES = [
  { value: '', label: 'Any priority' },
  { value: 'missed_followup', label: 'Missed follow-up' },
  { value: 'due_today', label: 'Due today' },
  { value: 'expires_48h', label: 'Expires in 48 hours' },
  { value: 'untouched', label: 'Untouched' },
];
const withAll = (label, list) => [{ value: '', label }, ...list.map((v) => ({ value: v, label: v }))];

/** Shared by "Lead Pool" (mode="pool") and "My Leads" (mode="mine"). Filtering, sorting and paging are server-side. */
export default function LeadsExplorer({ mode }) {
  const pool = mode === 'pool';
  const poolStore = useLeadPoolStore();
  const mineStore = useMyLeadsStore();
  const s = pool ? poolStore : mineStore;
  const { items, meta, filters, isLoading, hasLoaded, error, setFilters, setPage, fetch } = s;
  const { open, modals } = useLeadModals();
  const options = useLeadFilterOptions(pool ? 'pool' : 'mine');
  const [claiming, setClaiming] = useState(false);

  // search + minimum score: debounced, then pushed into the store (which resets to page 1)
  const [search, setSearch] = useState(filters.search);
  const [minScore, setMinScore] = useState(filters.minScore);
  const dSearch = useDebounce(search, 300);
  const dMin = useDebounce(minScore, 300);
  const store = pool ? useLeadPoolStore : useMyLeadsStore;
  useEffect(() => {
    if (store.getState().filters.search !== dSearch) setFilters({ search: dSearch });
  }, [dSearch, setFilters, store]);
  useEffect(() => {
    if (String(store.getState().filters.minScore) !== String(dMin)) setFilters({ minScore: dMin });
  }, [dMin, setFilters, store]);

  useEffect(() => { fetch(); }, [filters, fetch]);

  const quota = pool ? meta?.claimQuota : null;
  const exhausted = quotaExhausted(quota);

  const doClaim = async (ids) => {
    setClaiming(true);
    try {
      await poolStore.claim(ids);
    } catch (err) {
      showToast(friendlyError(err));
    } finally {
      setClaiming(false);
    }
  };

  const columns = [
    ...(pool
      ? [{ header: 'Select', cell: (l) => <input type="checkbox" aria-label={`Select ${l.name}`} checked={poolStore.selectedIds.has(l.id)} onChange={() => poolStore.toggleSelect(l.id)} /> }]
      : []),
    { header: 'Provider / NPI', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
    { header: 'Specialty', key: 'specialty' },
    { header: 'Score', key: 'score' },
    { header: 'Practice phone', cell: (l) => l.primaryPhone || '—' },
    { header: 'Local time', cell: (l) => providerLocalTime(l.timezone) },
    { header: 'State', key: 'state' },
    ...(pool
      ? []
      : [
          { header: 'Status', cell: (l) => <StatusBadge label={l.stage} tone="default" /> },
          { header: 'Attempts', key: 'attempts' },
          { header: 'Last activity', cell: (l) => fmtLocal(l.lastActivityAt) },
          { header: 'Follow-up', cell: (l) => fmtLocal(l.nextFollowUpAt) },
          { header: 'Expiry', cell: (l) => fmtLocal(l.expiresAt) },
        ]),
    {
      header: 'Action',
      cell: (l) =>
        pool ? (
          <Button variant="primary" disabled={claiming || exhausted} onClick={() => doClaim([l.id])}>Assign to me</Button>
        ) : (
          <Button onClick={() => open('lead', l.id)}>Open lead</Button>
        ),
    },
  ];

  const selectedCount = pool ? poolStore.selectedIds.size : 0;
  const notice = pool ? poolStore.lastClaim : null;

  return (
    <>
      <PageHeader
        title={pool ? 'Lead Pool' : 'My Leads'}
        subtitle={pool ? 'Claim available providers from the shared company pool.' : 'Manage your assigned providers, outreach and next actions.'}
        actions={pool && quota && <StatusBadge label={`${quota.used} / ${quota.limit} claimed this hour`} tone="default" />}
      />
      <Panel>
        <div className="my-3 flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, NPI, specialty or phone" label="Search providers" />
          <FilterDropdown label="State" value={filters.state} onChange={(v) => setFilters({ state: v })} options={withAll('All states', options.states)} />
          <FilterDropdown label="NPI type" value={filters.providerType} onChange={(v) => setFilters({ providerType: v })} options={withAll('All types', options.providerTypes)} />
          {!pool && <FilterDropdown label="Status" value={filters.stage} onChange={(v) => setFilters({ stage: v })} options={withAll('All statuses', options.stages)} />}
          <label className="m-0 flex items-center gap-2 text-xs font-semibold">
            Minimum score
            <input type="number" min="0" max="100" value={minScore} onChange={(e) => setMinScore(e.target.value)} className={`${fieldClass} w-[85px]`} />
          </label>
          <FilterDropdown label="Sort" value={filters.sort} onChange={(v) => setFilters({ sort: v })} options={SORTS} />
        </div>
        <details className="border-t border-line py-2.5">
          <summary className="cursor-pointer font-semibold">More filters</summary>
          <div className="my-3 flex flex-wrap items-center gap-3">
            <FilterDropdown label="Specialty" value={filters.specialty} onChange={(v) => setFilters({ specialty: v })} options={withAll('All specialties', options.specialties)} />
            <label className="m-0 flex items-center gap-2 text-xs font-semibold">
              {pool ? 'Enumerated from' : 'Assigned from'}
              <input type="date" value={filters.from} onChange={(e) => setFilters({ from: e.target.value })} className={fieldClass} />
            </label>
            <label className="m-0 flex items-center gap-2 text-xs font-semibold">
              Through
              <input type="date" value={filters.to} onChange={(e) => setFilters({ to: e.target.value })} className={fieldClass} />
            </label>
            {!pool && <FilterDropdown label="Follow-up or ownership" value={filters.priority} onChange={(v) => setFilters({ priority: v })} options={PRIORITIES} />}
          </div>
        </details>

        {pool && (
          <div className="my-3 flex flex-wrap items-center gap-3">
            <Button disabled={!selectedCount || exhausted || claiming} onClick={() => doClaim([...poolStore.selectedIds])}>
              Claim selected ({selectedCount})
            </Button>
            {exhausted && <span className="text-xs text-danger">Hourly claim limit reached. Try again later.</span>}
          </div>
        )}
        {notice && (
          <div role="status" className="my-3 rounded-md border border-line bg-warn-bg px-3 py-2 text-sm text-warn">
            <strong>{notice.claimed} of {notice.requested} claimed.</strong>
            <ul className="ml-5 list-disc">{notice.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            <Button variant="link" onClick={poolStore.dismissClaimNotice}>Dismiss</Button>
          </div>
        )}

        <ErrorBanner message={error} onRetry={fetch} />
        <Table columns={columns} rows={items} rowKey={(l) => l.id} loading={isLoading} empty={hasLoaded || error ? 'No records match this view.' : ''} />
        <Pagination meta={meta} disabled={isLoading} onPage={setPage} onLimit={(limit) => setFilters({ limit })} />
      </Panel>
      {modals}
    </>
  );
}
