import { http } from '../../http';
import { ENDPOINTS } from '../../constant';
import { buildQuery } from '../../query';

const L = ENDPOINTS.leads;

/** Thin wrappers over the Leads API. Lists resolve { data, meta }; the rest resolve `data`. Errors are ApiError. */
export const leadFiltersRequest = (scope) => http(L.filters + buildQuery({ scope }));
export const poolRequest = (params) => http(L.pool + buildQuery(params), { meta: true });
export const claimRequest = (leadIds) => http(L.claim, { method: 'POST', body: { leadIds } });
export const mineRequest = (params) => http(L.mine + buildQuery(params), { meta: true });
export const leadDetailRequest = (id) => http(L.one(id));
export const addContactRequest = (id, body) => http(`${L.one(id)}/contacts`, { method: 'POST', body });
export const shareLeadRequest = (id, body) => http(`${L.one(id)}/share`, { method: 'POST', body });
export const adminLeadsRequest = (params) => http(ENDPOINTS.adminLeads + buildQuery(params), { meta: true });

/** UI filter state -> API query params (the UI keeps short names; the API names are mapped here). */
export const poolParams = (f) => ({
  search: f.search, state: f.state, providerType: f.providerType, minScore: f.minScore, specialty: f.specialty,
  enumeratedFrom: f.from, enumeratedTo: f.to, sort: f.sort, page: f.page, limit: f.limit,
});
export const mineParams = (f) => ({
  search: f.search, state: f.state, providerType: f.providerType, stage: f.stage, minScore: f.minScore,
  specialty: f.specialty, assignedFrom: f.from, assignedTo: f.to, priority: f.priority, sort: f.sort,
  page: f.page, limit: f.limit,
});
export const adminParams = (f) => ({ search: f.search, stage: f.stage, ownerId: f.ownerId, page: f.page, limit: f.limit });

const CLAIM_REASONS = {
  LEAD_ALREADY_CLAIMED: (n) => `${n} already claimed by someone else`,
  CLAIM_LIMIT_REACHED: () => 'Hourly claim limit reached',
  NOT_FOUND: (n) => `${n} no longer available`,
};

/** Short, human summary of a claim response: { title, reasons[] }. */
export function describeClaim(requested, data) {
  const counts = {};
  data.failed.forEach((f) => { counts[f.reasonCode] = (counts[f.reasonCode] || 0) + 1; });
  const reasons = Object.entries(counts).map(([code, n]) => (CLAIM_REASONS[code] ? CLAIM_REASONS[code](n) : `${n} failed (${code})`));
  return { title: `${data.claimed.length} of ${requested} claimed`, reasons };
}
