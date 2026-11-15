import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, Panel, AnalyticsCard, StatGrid, FilterDropdown, BarChart, Table, ProviderCell, Button, EmptyState } from '../../../components/shared';
import { useLeadModals } from '../../../components/Bde/LeadModals';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { getFollowUps } from '../../../store/features/bde/selectors';
import { BDE_PERIODS } from '../../../utils/data';
import { BDE_USER } from '../../../store/constant';
import { DAY, fmtLocal, getBdeRange, now, sameDay } from '../../../utils/utils';

export default function BdeDashboard() {
  const { leads, calls } = useBdeStore();
  const { open, modals } = useLeadModals();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('Last 7 days');

  const [lo, hi] = getBdeRange(period);
  const inside = (t) => t >= lo && t <= hi;
  const events = calls.filter((e) => inside(e.at));
  const hist = leads.flatMap((l) => l.history);
  const fs = getFollowUps(leads);
  const end = now();

  const metrics = [
    ['Total dials', events.length, 'dials'],
    ['Connected', events.filter((e) => e.connected).length, 'connected'],
    ['Appointments set', hist.filter((e) => e.label === 'Appointment scheduled' && inside(e.at)).length, 'appointments'],
    ['BAA sent', hist.filter((e) => e.label === 'BAA sent' && inside(e.at)).length, 'baa'],
    ['Clients achieved', leads.filter((l) => l.achieved && inside(l.achieved)).length, 'clients'],
    ['Today’s follow-ups', fs.filter((l) => sameDay(l.follow.at, end)).length, 'today'],
    ['Missed follow-ups', fs.filter((l) => l.follow.at < end).length, 'missed'],
  ];
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = end - (6 - i) * DAY;
    return { label: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }), value: calls.filter((e) => sameDay(e.at, t)).length };
  });
  const recent = leads
    .filter((l) => l.owner === BDE_USER || l.transfer?.from === BDE_USER)
    .flatMap((l) => l.history.map((e) => ({ l, e })))
    .sort((a, b) => b.e.at - a.e.at)
    .slice(0, 5);

  const onMetric = (k) => {
    if (k === 'today' || k === 'missed') navigate(`/bde/follow-ups?tab=${k === 'today' ? 'Today' : 'Missed'}`);
    else open('metric', k, { period });
  };

  return (
    <>
      <PageHeader
        title="Sales dashboard"
        subtitle={new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        actions={<FilterDropdown label="Performance period" value={period} onChange={setPeriod} options={BDE_PERIODS} />}
      />
      <StatGrid cols={7}>
        {metrics.map(([label, n, k]) => (
          <AnalyticsCard key={k} label={label} value={n} tone={k === 'missed' && n ? 'danger' : undefined} onClick={() => onMetric(k)} />
        ))}
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <Panel title="Dial activity" tone="trend">
          <small className="text-[#c1d6d7]">Last seven days</small>
          <BarChart data={days} />
        </Panel>
        <Panel title="Follow-up queue" actions={<Link to="/bde/follow-ups" className="font-semibold text-brand hover:underline">View all →</Link>}>
          {fs.slice(0, 3).map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3.5 border-b border-line py-2.5 last:border-0">
              <div>
                <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} />
                <small className="block text-muted">{fmtLocal(l.follow.at)} · {l.follow.reason}</small>
              </div>
              <Button onClick={() => open('lead', l.id)}>Open</Button>
            </div>
          ))}
          {!fs.length && <EmptyState>Your queue is clear.</EmptyState>}
        </Panel>
      </div>

      <Panel title="Recent activity" actions={<Link to="/bde/my-leads" className="font-semibold text-brand hover:underline">Open my leads →</Link>}>
        <Table
          columns={[
            { header: 'Provider', cell: ({ l }) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
            { header: 'Activity', cell: ({ e }) => e.label },
            { header: 'Recorded by', cell: ({ e }) => e.by },
            { header: 'When', cell: ({ e }) => fmtLocal(e.at) },
          ]}
          rows={recent}
          rowKey={({ l, e }) => `${l.id}-${e.at}-${e.label}`}
          empty="No records match this view."
        />
      </Panel>
      {modals}
    </>
  );
}
