import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Panel, AnalyticsCard, StatGrid, FilterDropdown } from '../shared';
import AgentPerformance from './AgentPerformance';
import { useAdminModals } from './Modals';
import { useAdminStore } from '../../store/features/admin/useAdminStore';
import { isFixed } from '../../store/features/admin/adminFns';
import { ADMIN_METRIC_KEYS, ADMIN_PERIODS } from '../../utils/data';
import { countEvents, fmtZone, getPeriodBounds, now } from '../../utils/utils';

/** Shared by the Dashboard and Reports pages. `report` hides the "needs attention / recent" row. */
export default function CompanyOverview({ report = false }) {
  const { name, zone, leads, agents, events, transfers, clients } = useAdminStore();
  const [period, setPeriod] = useState('This Week');
  const { open, modals } = useAdminModals();

  const [cur, prev] = getPeriodBounds(period, zone);
  const inRange = (r) => events.filter((e) => e.at >= r[0] && e.at < r[1]);
  const ev = inRange(cur);
  const v = countEvents(ev);
  const pv = countEvents(inRange(prev));

  const todayStr = new Date().toLocaleDateString('en-US', { timeZone: zone });
  const snapshot = [
    ["Today’s follow-ups", leads.filter((l) => l.due && new Date(l.due).toLocaleDateString('en-US', { timeZone: zone }) === todayStr).length],
    ['Missed follow-ups', leads.filter((l) => l.due && l.due < now()).length],
    ['Available pool', leads.filter((l) => l.stage === 'Available').length],
    ['Claimed leads', leads.filter((l) => l.owner && !isFixed(l)).length],
    ['Active sales users', agents.filter((a) => a.status === 'Active').length],
  ];
  const hint = (val, i) =>
    period === 'All Time'
      ? 'All recorded activity'
      : pv[i]
        ? `${val >= pv[i] ? '+' : ''}${Math.round((100 * (val - pv[i])) / pv[i])}% vs prior period`
        : val
          ? 'New this period'
          : 'No prior activity';

  const attention = [
    [leads.filter((l) => l.stage === 'Admin review').length, 'Warm leads awaiting reassignment', '/admin/lead-management?stage=Admin%20review'],
    [transfers.filter((t) => t.status === 'Pending').length, 'Pending handoffs', '/admin/transfers'],
    [clients.filter((c) => !c.contract).length, 'Contracts to send', '/admin/clients-finance'],
  ];

  return (
    <>
      <PageHeader
        eyebrow={name}
        title={report ? 'Sales reports' : 'Company overview'}
        subtitle={report ? 'Compare outreach and conversions across the sales team.' : 'Sales performance and work awaiting your team.'}
        actions={<FilterDropdown label="Reporting period" value={period} onChange={setPeriod} options={ADMIN_PERIODS} />}
      />
      <StatGrid cols={5}>
        {ADMIN_METRIC_KEYS.map((k, i) => <AnalyticsCard key={k} label={k} value={v[i]} hint={hint(v[i], i)} />)}
        {snapshot.map(([label, val]) => <AnalyticsCard key={label} label={label} value={val} hint="Current snapshot" />)}
      </StatGrid>

      {!report && (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          <Panel title="Needs attention" tone="dark">
            {attention.map(([n, label, to]) => (
              <div key={label} className="flex items-center justify-between gap-3.5 border-b border-[#456069] py-2.5 last:border-0">
                <span><b>{n}</b> &nbsp;{label}</span>
                <Link to={to} className="font-semibold text-[#b8efd6] hover:underline">Review →</Link>
              </div>
            ))}
          </Panel>
          <Panel title="Recent changes">
            {events.slice().sort((a, b) => b.at - a.at).slice(0, 3).map((e, i) => (
              <div key={i} className="border-b border-line py-2.5 last:border-0">
                <b>{e.type}</b>
                <small className="block text-muted">{e.actor} · {fmtZone(e.at, zone)}</small>
              </div>
            ))}
          </Panel>
        </div>
      )}

      <AgentPerformance agents={agents} leads={leads} events={ev} onOpenAgent={(id) => open('agent', id)} />
      {modals}
    </>
  );
}
