// Business logic for the Admin console. Every function receives a draft copy of the
// admin state `s` and a payload, mutates the draft and throws Error(message) on
// validation failures. When the backend is ready, replace each body with an http() call.
import { DAY, nextId, now, parseFuture, str } from '../../../utils/utils';
import { MEETING_NEEDS_TIME } from '../../../utils/data';

const N = Number;
export const isFixed = (l) => ['Do not call', 'Not interested', 'Client achieved'].includes(l.stage);
export const isWarm = (l) => ['Showing interest', 'Appointment', 'BAA sent', 'Admin review'].includes(l.stage);
export const getLead = (s, id) => s.leads.find((l) => l.id === N(id));
export const getAgent = (s, id) => s.agents.find((a) => a.id === N(id));
const ownerName = (s, id) => getAgent(s, id)?.name || 'Unassigned';
const log = (s, type, note = '', lead = 0) =>
  s.events.unshift({ at: now(), actor: 'Company admin', agent: 0, lead, type, note });

export const nextStep = (c) =>
  !c.contract ? 'Send contract' : c.invoice === null ? 'Send invoice' : !c.paid ? 'Record payment' : !c.work ? 'Mark work started' : 'Complete';

/* ---- leads ---- */
function changeOwner(s, l, to, reason) {
  const prev = ownerName(s, l.owner);
  l.owner = to;
  if (l.stage === 'Admin review') l.stage = l.previous || 'Showing interest';
  if (l.stage === 'Available') l.stage = 'Fresh';
  s.transfers.filter((t) => t.lead === l.id && t.status === 'Pending').forEach((t) => (t.status = 'Superseded'));
  s.meetings.filter((m) => m.lead === l.id).forEach((m) => (m.owner = to));
  log(s, 'Lead reassigned', `${prev} → ${ownerName(s, to)} · ${reason}`, l.id);
}

export function reassignLeads(s, { ids, owner, note }) {
  const to = getAgent(s, owner);
  if (!to || to.status !== 'Active') throw Error('Select an active agent.');
  for (const id of ids) {
    const l = getLead(s, id);
    if (l && !isFixed(l)) changeOwner(s, l, to.id, str(note));
  }
}

/* ---- team ---- */
export function saveAgent(s, p) {
  const id = p.id ? N(p.id) : null;
  const email = str(p.email);
  if (s.agents.some((m) => m.email.toLowerCase() === email.toLowerCase() && m.id !== id))
    throw Error('That work email already belongs to a team member.');
  const m = id ? getAgent(s, id) : { id: nextId(s.agents), status: 'Invited' };
  Object.assign(m, { name: str(p.name), phone: str(p.phone), email, role: p.role, quota: N(p.quota) });
  if (!id) s.agents.push(m);
  log(s, id ? 'Agent updated' : 'Agent invited', m.name);
}

export function changeAgentStatus(s, { id, action, note }) {
  const m = getAgent(s, id);
  const n = str(note);
  m.status = action === 'reactivate' ? 'Active' : action === 'revoke' ? 'Revoked' : 'Suspended';
  if (action === 'suspend') {
    for (const l of s.leads.filter((x) => x.owner === m.id && !isFixed(x))) {
      const w = isWarm(l);
      l.previous = l.stage;
      l.stage = w ? 'Admin review' : 'Available';
      l.owner = 0;
      if (!w) l.due = null;
      log(s, w ? 'Warm lead queued' : 'Returned to pool', n, l.id);
    }
    s.transfers.filter((t) => (t.from === m.id || t.to === m.id) && t.status === 'Pending').forEach((t) => (t.status = 'Cancelled'));
  }
  log(s, 'Agent ' + m.status.toLowerCase(), `${m.name} · ${n}`);
}

export function cancelTransfer(s, { id, note }) {
  const t = s.transfers.find((x) => x.id === N(id));
  t.status = 'Cancelled';
  log(s, 'Handoff cancelled', str(note), t.lead);
}

/* ---- NPPES imports ---- */
export function saveRules(s, { spec, min }) {
  s.rules = { allow: [].concat(spec ?? []), min: N(min) };
  log(s, 'Import rules updated');
}

export function prepareBatch(s, p) {
  const b = {
    id: nextId(s.imports),
    name: str(p.name),
    kind: p.kind,
    source: p.source,
    period: p.period,
    state: p.state,
    rows: p.rows, // providers that passed the rules (already limited)
    total: p.total, // every record in the weekly file
    inScope: p.inScope, // behavioral-health providers with a US phone
    passing: p.passing, // pass allowed-specialty + min-score rules
    status: 'Preview ready',
  };
  s.imports.unshift(b);
  return b.id;
}

/** Adds the batch's providers to the lead pool. Returns the NPIs that were new. */
export function publishBatch(s, { id }) {
  const b = s.imports.find((x) => x.id === N(id));
  if (b.status === 'Published') return [];
  const added = [];
  for (const l of b.rows) {
    if (s.leads.some((x) => x.npi === l.npi)) continue;
    s.leads.push({
      id: nextId(s.leads), npi: l.npi, name: l.name, specialty: l.specialty, state: l.state, score: l.score,
      phone: l.phone, stage: 'Available', owner: 0, due: null,
    });
    added.push(l.npi);
  }
  b.status = 'Published';
  log(s, 'Batch published', `${b.name} · ${added.length} new leads`);
  return added;
}

/** A BDE claimed leads from the pool — mirror it here. */
export function syncClaims(s, { npis, owner }) {
  const agent = s.agents.find((a) => a.name === owner);
  for (const l of s.leads.filter((x) => npis.includes(x.npi))) {
    l.owner = agent?.id || 0;
    l.stage = 'Fresh';
  }
}

/* ---- appointments ---- */
export function scheduleMeeting(s, p) {
  const l = getLead(s, p.lead);
  const at = new Date(p.at).getTime();
  if (!l || !(at > now())) throw Error('Choose an eligible provider and future time.');
  s.meetings.push({
    id: nextId(s.meetings), lead: l.id, at, owner: l.owner, status: 'Pending confirmation',
    link: str(p.url), email: str(p.email), service: p.service, participants: str(p.participants), note: str(p.note),
  });
  l.stage = 'Appointment';
  log(s, 'Appointment set', str(p.note), l.id);
}

export function updateMeeting(s, { id, status, at, note }) {
  const m = s.meetings.find((x) => x.id === N(id));
  if (status === 'No-show' && m.at > now()) throw Error('The meeting time must pass before marking a no-show.');
  if (MEETING_NEEDS_TIME.includes(status)) {
    const t = parseFuture(at, 'Select a future time.');
    if (!t) throw Error('Select a future time.');
    if (status === 'Follow-up required') getLead(s, m.lead).due = t;
    else m.at = t;
  }
  m.status = status;
  m.note = str(note);
  log(s, status, str(note), m.lead);
}

/* ---- clients & finance ---- */
export function recordFinancialStep(s, { leadId, amount, due, note }) {
  const c = s.clients.find((x) => x.lead === N(leadId));
  const step = nextStep(c);
  if (step === 'Send contract') c.contract = true;
  else if (step === 'Send invoice') {
    c.invoice = N(amount);
    c.due = str(due);
  } else if (step === 'Record payment') c.paid = true;
  else c.work = true;
  log(s, step, str(note), c.lead);
}

/* ---- settings ---- */
export function updateSettings(s, p) {
  Object.assign(s, { name: str(p.name), zone: p.zone, quota: N(p.quota) });
  log(s, 'Company settings updated');
}

/* ---- platform ---- */
export function saveTenant(s, p) {
  const existing = p.id ? s.tenants.find((t) => t.id === N(p.id)) : null;
  if (s.tenants.some((t) => t.slug === str(p.slug) && t !== existing)) throw Error('Workspace slug already exists.');
  const t = existing || { id: nextId(s.tenants) };
  Object.assign(t, {
    name: str(p.name), slug: str(p.slug), email: str(p.email), status: p.status, plan: p.plan,
    seats: N(p.seats), storage: N(p.storage), limit: N(p.limit),
  });
  if (!existing) s.tenants.push(t);
}

export function savePlan(s, p) {
  const idx = p.index === '' || p.index == null ? null : N(p.index);
  const cur = idx === null ? null : s.plans[idx];
  const name = str(p.name);
  if (s.plans.some((x) => x !== cur && x.name.toLowerCase() === name.toLowerCase())) throw Error('Plan name already exists.');
  if (cur) s.tenants.filter((t) => t.plan === cur.name).forEach((t) => (t.plan = name));
  const data = { name, setup: N(p.setup), monthly: N(p.monthly) };
  if (cur) Object.assign(cur, data);
  else s.plans.push(data);
}

export function addLedgerEntry(s, p) {
  s.ledger.unshift({ company: p.company, kind: p.kind, amount: N(p.amount), ref: str(p.ref), at: now() });
}

export function savePlatformName(s, { name }) {
  s.platformName = str(name);
}

export { DAY };
