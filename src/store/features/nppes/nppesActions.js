// Cross-store actions: the Admin console and the BDE workspace share the same leads
// in the demo. The backend will replace this with one database.
import { useAdminStore } from '../admin/useAdminStore';
import { useBdeStore } from '../bde/useBdeStore';

/** Admin publishes an import batch → leads land in the company pool (admin + BDE views). */
export function publishBatchToPool(batchId) {
  const batch = useAdminStore.getState().imports.find((b) => b.id === Number(batchId));
  const added = useAdminStore.getState().publishBatch({ id: batchId }) || [];
  if (added.length) useBdeStore.getState().addPoolLeads({ rows: batch.rows.filter((r) => added.includes(r.npi)), batch: batch.name });
  return added.length;
}

/** BDE claims leads from the pool → mirror ownership in the admin console. */
export function claimPoolLeads(ids) {
  const bde = useBdeStore.getState();
  const npis = ids.map((id) => bde.leads.find((l) => l.id === Number(id))?.npi).filter(Boolean);
  const count = bde.claimLeads({ ids });
  const claimed = useBdeStore.getState().leads.filter((l) => npis.includes(l.npi) && l.owner === 'Zack').map((l) => l.npi);
  if (claimed.length) useAdminStore.getState().syncClaims({ npis: claimed, owner: 'Zack' });
  return count;
}
