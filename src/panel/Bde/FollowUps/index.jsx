import { useSearchParams } from 'react-router-dom';
import { PageHeader, Panel, Table, Tabs, Button, ProviderCell } from '../../../components/shared';
import { useLeadModals } from '../../../components/Bde/LeadModals';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { getFollowUps } from '../../../store/features/bde/selectors';
import { fmtLocal, now, sameDay } from '../../../utils/utils';
import { BDE_USER } from '../../../store/constant';

const TABS = ['Open', 'Today', 'Upcoming', 'Missed', 'Completed'];

export default function FollowUps() {
  const leads = useBdeStore((s) => s.leads);
  const { open, modals } = useLeadModals();
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'Open';

  const list = getFollowUps(leads).filter((l) =>
    tab === 'Open' ? true : tab === 'Today' ? sameDay(l.follow.at, now()) : tab === 'Missed' ? l.follow.at < now() : l.follow.at >= now(),
  );
  const completed = leads.filter((l) => l.owner === BDE_USER).flatMap((l) => l.completed.map((f) => ({ l, f })));

  return (
    <>
      <PageHeader title="Follow-ups" subtitle="Review scheduled calls and record what happens next." />
      <Panel>
        <Tabs tabs={TABS} value={tab} onChange={(t) => setParams({ tab: t })} />
        {tab === 'Completed' ? (
          <Table
            columns={[
              { header: 'Provider', cell: ({ l }) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
              { header: 'Completed', cell: ({ f }) => fmtLocal(f.doneAt) },
              { header: 'Reason', cell: ({ f }) => f.reason },
            ]}
            rows={completed}
            empty="No records match this view."
          />
        ) : (
          <Table
            columns={[
              { header: 'Provider', cell: (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} /> },
              { header: 'Due (your time)', cell: (l) => fmtLocal(l.follow.at) },
              { header: 'Reason', cell: (l) => l.follow.reason },
              { header: 'Status', cell: (l) => (l.follow.at < now() ? <b className="text-danger">Missed</b> : 'Scheduled') },
              {
                header: 'Actions',
                cell: (l) => (
                  <span className="inline-flex gap-2">
                    <Button onClick={() => open('call', l.id)}>Record call</Button>
                    <Button onClick={() => open('reschedule', l.id)}>Reschedule</Button>
                    <Button onClick={() => open('complete', l.id)}>Complete</Button>
                  </span>
                ),
              },
            ]}
            rows={list}
            rowKey={(l) => l.id}
            empty="No records match this view."
          />
        )}
      </Panel>
      {modals}
    </>
  );
}
