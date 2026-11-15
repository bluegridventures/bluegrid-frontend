import { useState } from 'react';
import { Panel, Table, Button, FilterDropdown } from '../shared';
import { ADMIN_METRIC_KEYS } from '../../utils/data';
import { countEvents, now } from '../../utils/utils';
import { isFixed } from '../../store/features/admin/adminFns';

export default function AgentPerformance({ agents, leads, events, onOpenAgent }) {
  const [order, setOrder] = useState('Dials');
  const i = ADMIN_METRIC_KEYS.indexOf(order);
  const rows = agents
    .map((a) => ({
      a,
      v: countEvents(events.filter((e) => e.agent === a.id)),
      assigned: leads.filter((l) => l.owner === a.id && !isFixed(l)),
    }))
    .sort((x, y) => y.v[i] - x.v[i]);

  return (
    <Panel
      title="Agent performance"
      actions={<FilterDropdown label="Sort agents by metric" value={order} onChange={setOrder} options={ADMIN_METRIC_KEYS} />}
    >
      <Table
        columns={[
          { header: 'Team member', cell: (r) => <Button variant="link" onClick={() => onOpenAgent(r.a.id)}>{r.a.name}</Button> },
          ...ADMIN_METRIC_KEYS.map((k, idx) => ({ header: k, cell: (r) => r.v[idx] })),
          { header: 'Active leads', cell: (r) => r.assigned.length },
          { header: 'Missed', cell: (r) => r.assigned.filter((l) => l.due && l.due < now()).length },
        ]}
        rows={rows}
        rowKey={(r) => r.a.id}
      />
    </Panel>
  );
}
