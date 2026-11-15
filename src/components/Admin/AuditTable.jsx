import { Table, ProviderCell } from '../shared';
import { useAdminStore } from '../../store/features/admin/useAdminStore';
import { fmtZone } from '../../utils/utils';

/** Activity / audit log table. `onOpenLead(id)` makes provider names clickable. */
export default function AuditTable({ events, onOpenLead }) {
  const { leads, zone } = useAdminStore();
  const rows = events.slice().sort((a, b) => b.at - a.at).slice(0, 120);
  return (
    <Table
      columns={[
        { header: 'Time', cell: (e) => fmtZone(e.at, zone) },
        { header: 'User', key: 'actor' },
        {
          header: 'Provider',
          cell: (e) => {
            const l = e.lead ? leads.find((x) => x.id === e.lead) : null;
            return l ? <ProviderCell name={l.name} npi={l.npi} onClick={onOpenLead && (() => onOpenLead(l.id))} /> : '—';
          },
        },
        { header: 'Activity', key: 'type' },
        { header: 'Details', key: 'note' },
      ]}
      rows={rows}
    />
  );
}
