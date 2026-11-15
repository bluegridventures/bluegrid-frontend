import { useState } from 'react';
import { PageHeader, Panel, Table, Button, SearchBar, FilterDropdown, StatusBadge, ProviderCell, showToast, fieldClass } from '../shared';
import { useLeadModals } from './LeadModals';
import { useBdeStore } from '../../store/features/bde/useBdeStore';
import { claimsThisHour, isOwned } from '../../store/features/bde/bdeFns';
import { BDE_HOURLY_CLAIM_LIMIT } from '../../store/constant';
import { DAY, fmtLocal, matchText, now, sameDay } from '../../utils/utils';

const SORTS = ['Highest score', 'Provider A–Z', 'Newest enumeration'];
const PRIORITIES = ['Any priority', 'Missed follow-up', 'Due today', 'Expires in 48 hours', 'Untouched'];
const initial = {
  q: '', state: 'All states', type: 'All types', status: 'All statuses', minScore: '', sort: SORTS[0],
  specialty: 'All specialties', batch: 'All batches', from: '', to: '', priority: PRIORITIES[0],
};

/** Shared by "Lead Pool" (mode="pool") and "My Leads" (mode="mine"). */
export default function LeadsExplorer({ mode }) {
  const pool = mode === 'pool';
  const { leads, claims } = useBdeStore();
  const { open, modals } = useLeadModals();
  const [f, setF] = useState(initial);
  const [selected, setSelected] = useState(new Set());
  const set = (k) => (v) => setF((prev) => ({ ...prev, [k]: v }));

  const matchesExtra = (l) => {
    const d = pool ? l.enum : l.claimed;
    if (f.specialty !== 'All specialties' && f.specialty !== l.specialty) return false;
    if (pool && f.batch !== 'All batches' && f.batch !== (l.id % 2 ? 'Sample weekly update' : 'Sample baseline')) return false;
    if (f.from && d < new Date(f.from + 'T00:00').getTime()) return false;
    if (f.to && d > new Date(f.to + 'T23:59:59.999').getTime()) return false;
    switch (f.priority) {
      case 'Missed follow-up': return !!l.follow && l.follow.at < now();
      case 'Due today': return !!l.follow && sameDay(l.follow.at, now());
      case 'Expires in 48 hours': return !!l.expiry && l.expiry <= now() + 2 * DAY;
      case 'Untouched': return l.attempts === 0;
      default: return true;
    }
  };

  const rows = leads
    .filter(
      (l) =>
        (pool ? l.status === 'Available' : isOwned(l)) &&
        (f.state === 'All states' || l.state === f.state) &&
        (f.type === 'All types' || l.type === f.type) &&
        (pool || f.status === 'All statuses' || l.status === f.status) &&
        matchesExtra(l) &&
        l.score >= Number(f.minScore) &&
        matchText([l.name, l.npi, l.specialty, ...l.phones.map((p) => p.value), ...(pool ? [] : l.history.map((e) => e.note))], f.q),
    )
    .sort((a, b) => (f.sort === 'Provider A–Z' ? a.name.localeCompare(b.name) : f.sort === 'Newest enumeration' ? b.enum - a.enum : b.score - a.score));

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const title = pool ? 'Lead Pool' : 'My Leads';
  const columns = [
    ...(pool ? [{ header: 'Select', cell: (l) => <input type="checkbox" aria-label={`Select ${l.name}`} checked={selected.has(l.id)} onChange={() => toggle(l.id)} /> }] : []),
    { header: 'Provider / NPI', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
    { header: 'Specialty', key: 'specialty' },
    { header: 'Score', key: 'score' },
    { header: 'Practice phone', cell: (l) => l.phones[0].value },
    { header: 'Local time', cell: (l) => new Date().toLocaleTimeString('en-US', { timeZone: l.tz, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) },
    { header: 'State', key: 'state' },
    ...(pool
      ? []
      : [
          { header: 'Status', cell: (l) => <StatusBadge label={l.status} tone="default" /> },
          { header: 'Attempts', key: 'attempts' },
          { header: 'Last activity', cell: (l) => fmtLocal(l.history[0]?.at) },
          { header: 'Follow-up', cell: (l) => fmtLocal(l.follow?.at) },
          { header: 'Expiry', cell: (l) => fmtLocal(l.expiry) },
        ]),
    {
      header: 'Action',
      cell: (l) =>
        pool ? <Button variant="primary" onClick={() => open('claim', l.id)}>Assign to me</Button> : <Button onClick={() => open('lead', l.id)}>Open lead</Button>,
    },
  ];

  const states = ['All states', ...new Set(leads.map((l) => l.state))];
  const specialties = ['All specialties', ...new Set(leads.map((l) => l.specialty))];
  const statuses = ['All statuses', ...new Set(leads.filter(isOwned).map((l) => l.status))];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={pool ? 'Claim available providers from the shared company pool.' : 'Manage your assigned providers, outreach and next actions.'}
        actions={pool && <StatusBadge label={`${claimsThisHour(claims)} / ${BDE_HOURLY_CLAIM_LIMIT} claimed this hour`} tone="default" />}
      />
      <Panel>
        <div className="my-3 flex flex-wrap items-center gap-3">
          <SearchBar value={f.q} onChange={set('q')} placeholder="Search name, NPI, phone or note" label="Search providers" />
          <FilterDropdown label="State" value={f.state} onChange={set('state')} options={states} />
          <FilterDropdown label="NPI type" value={f.type} onChange={set('type')} options={['All types', 'Individual', 'Organization']} />
          {!pool && <FilterDropdown label="Status" value={f.status} onChange={set('status')} options={statuses} />}
          <label className="m-0 flex items-center gap-2 text-xs font-semibold">
            Minimum score
            <input type="number" min="0" max="100" value={f.minScore} onChange={(e) => set('minScore')(e.target.value)} className={`${fieldClass} w-[85px]`} />
          </label>
          <FilterDropdown label="Sort" value={f.sort} onChange={set('sort')} options={SORTS} />
        </div>
        <details className="border-t border-line py-2.5">
          <summary className="cursor-pointer font-semibold">More filters</summary>
          <div className="my-3 flex flex-wrap items-center gap-3">
            <FilterDropdown label="Specialty" value={f.specialty} onChange={set('specialty')} options={specialties} />
            {pool && <FilterDropdown label="Import batch" value={f.batch} onChange={set('batch')} options={['All batches', 'Sample baseline', 'Sample weekly update']} />}
            <label className="m-0 flex items-center gap-2 text-xs font-semibold">
              {pool ? 'Enumerated from' : 'Assigned from'}
              <input type="date" value={f.from} onChange={(e) => set('from')(e.target.value)} className={fieldClass} />
            </label>
            <label className="m-0 flex items-center gap-2 text-xs font-semibold">
              Through
              <input type="date" value={f.to} onChange={(e) => set('to')(e.target.value)} className={fieldClass} />
            </label>
            {!pool && <FilterDropdown label="Follow-up or ownership" value={f.priority} onChange={set('priority')} options={PRIORITIES} />}
          </div>
        </details>
        {pool && (
          <div className="my-3">
            <Button
              onClick={() => {
                if (!selected.size) return showToast('Select at least one lead.');
                open('claimMany', [...selected]);
                setSelected(new Set());
              }}
            >
              Claim selected ({selected.size})
            </Button>
          </div>
        )}
        <Table columns={columns} rows={rows} rowKey={(l) => l.id} empty="No records match this view." />
      </Panel>
      {modals}
    </>
  );
}
