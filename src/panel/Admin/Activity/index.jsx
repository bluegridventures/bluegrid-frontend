import { useState } from 'react';
import { PageHeader, Panel, SearchBar } from '../../../components/shared';
import AuditTable from '../../../components/Admin/AuditTable';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { matchText } from '../../../utils/utils';

export default function Activity() {
  const { name, events, leads } = useAdminStore();
  const { open, modals } = useAdminModals();
  const [q, setQ] = useState('');
  const rows = events.filter((e) => matchText([e.actor, e.note, e.type, e.lead ? leads.find((l) => l.id === e.lead)?.name : ''], q));
  return (
    <>
      <PageHeader eyebrow={name} title="Activity monitoring" subtitle="Inspect agent outreach and administrative decisions." />
      <Panel title="Activity history">
        <div className="my-3">
          <SearchBar value={q} onChange={setQ} placeholder="Search agent, provider or event" />
        </div>
        <AuditTable events={rows} onOpenLead={(id) => open('lead', id)} />
      </Panel>
      {modals}
    </>
  );
}
