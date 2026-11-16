// Business logic for the BDE workspace. Each function mutates a draft `d` = { leads, calls, claims }.
// Replace the bodies with http() calls when the backend is available.
import { DAY, now, parseFuture, str, fmtLocal } from '../../../utils/utils';
import { BDE_HOURLY_CLAIM_LIMIT, BDE_USER } from '../../constant';
import { toBdeLead } from '../nppes/nppesFns';

export const isOwned = (l) => l.owner === BDE_USER && !l.achieved && !['Do not call', 'Not interested'].includes(l.status);
export const isPending = (l) => l.transfer?.state === 'Pending';
export const claimsThisHour = (claims) => claims.filter((t) => t > now() - 3600000).length;

const getLead = (d, id) => d.leads.find((l) => l.id === Number(id));
const log = (l, label, note = '') => l.history.unshift({ at: now(), by: BDE_USER, label, note });
const list = (v) => [].concat(v ?? []).map(String);
const requireOwner = (l) => {
  if (!l || !isOwned(l)) throw Error('Only the current owner can edit this lead.');
};
function finishFollow(l) {
  if (l.follow) {
    l.completed.unshift({ ...l.follow, doneAt: now() });
    l.follow = null;
  }
}

export function claimLeads(d, { ids }) {
  let count = 0;
  for (const id of ids) {
    const l = getLead(d, id);
    if (!l || l.status !== 'Available' || claimsThisHour(d.claims) >= BDE_HOURLY_CLAIM_LIMIT) continue;
    Object.assign(l, { owner: BDE_USER, status: 'Fresh', claimed: now(), expiry: now() + 2 * DAY });
    d.claims.push(now());
    log(l, 'Lead claimed');
    count++;
  }
  return count;
}

export function recordDisposition(d, p) {
  const l = getLead(d, p.leadId);
  requireOwner(l);
  const at = parseFuture(p.at);
  const v = str(p.outcome);
  const phones = list(p.phones);
  const sv = list(p.services);
  const note = str(p.note);
  if (!phones.length) throw Error('Select at least one dialed number.');
  if (['Showing interest', 'Appointment scheduled'].includes(v) && !sv.length) throw Error('Select at least one service.');
  if (v === 'Appointment scheduled' && !/^https?:\/\//i.test(str(p.link))) throw Error('Enter an https:// or http:// meeting link.');
  if (!note) throw Error('Enter a call note.');

  const protectedStage = l.appt && ['Appointment scheduled', 'BAA sent'].includes(l.status);
  const old = l.status;
  const skip = ['leadId', 'outcome', 'note', 'at'];
  const details = Object.entries(p)
    .filter(([k, val]) => !skip.includes(k) && val !== '' && !(Array.isArray(val) && !val.length))
    .map(([k, val]) => `${k}: ${[].concat(val).join(', ')}`)
    .join(' · ');

  if (l.follow && (at || ['Do not call', 'Not interested', 'Appointment scheduled'].includes(v) || l.follow.at <= now())) finishFollow(l);
  l.status = protectedStage && !['Do not call', 'Not interested'].includes(v) ? old : v;
  if (sv.length) l.services = sv;
  for (const phone of phones) {
    d.calls.unshift({ at: now(), id: l.id, phone, outcome: v, connected: !['No response', 'Wrong number'].includes(v) });
  }
  const first = l.attempts === 0;
  l.attempts += phones.length;
  if (v === 'Wrong number') l.phones.forEach((ph) => { if (phones.includes(ph.value)) ph.ok = false; });
  const replacement = str(p.replacement);
  if (replacement && !l.phones.some((ph) => ph.value === replacement && ph.ok)) {
    l.phones.push({ value: replacement, source: 'Manually supplied', ok: true });
  }

  if (v === 'Appointment scheduled') {
    l.email = str(p.email);
    l.appt = { at, status: 'Pending confirmation', email: l.email, link: str(p.link), participants: list(p.participants), comment: note };
    l.expiry = null;
  } else if (['Do not call', 'Not interested'].includes(v)) {
    Object.assign(l, { expiry: null, transfer: null, appt: null, owner: '', recycle: str(p.recycle) });
  } else {
    if (at) l.follow = { at, reason: str(p.reason) || v };
    if (!protectedStage) {
      const base = at ? at + 6 * DAY : now() + (first ? 14 : 6) * DAY;
      if (v === 'Showing interest') l.interestUntil = now() + 20 * DAY;
      l.expiry = Math.max(base, l.interestUntil || 0);
    }
  }
  log(l, v, note + (details ? ' · ' + details : '') + (at ? ' · ' + fmtLocal(at) : ''));
}

export function requestHandoff(d, p) {
  const l = getLead(d, p.leadId);
  requireOwner(l);
  const to = str(p.to);
  if (p.operation === 'Share read-only') {
    if (!l.shares.includes(to)) l.shares.push(to);
    log(l, 'Shared with ' + to, str(p.note));
  } else {
    l.transfer = { from: BDE_USER, to, state: 'Pending', reason: str(p.reason), note: str(p.note) };
    log(l, 'Transfer requested', `${to} · ${str(p.reason)} · ${str(p.note)}`);
  }
}

export function addContact(d, p) {
  const l = getLead(d, p.leadId);
  requireOwner(l);
  if (p.kind === 'Email') l.email = str(p.value);
  else l.phones.push({ value: str(p.value), source: `${str(p.source)} · ${p.verified}`, ok: true });
  log(l, 'Contact added', `${str(p.value)} · ${str(p.source)} · ${p.verified}`);
}

export function acceptTransfer(d, { leadId }) {
  const l = getLead(d, leadId);
  if (!isPending(l) || l.transfer.to !== BDE_USER) throw Error('This request is no longer pending.');
  l.transfer.state = 'Accepted';
  l.owner = BDE_USER;
  log(l, 'Transfer accepted', l.transfer.reason);
}

export function rejectTransfer(d, { leadId, note }) {
  const l = getLead(d, leadId);
  if (!isPending(l) || l.transfer.to !== BDE_USER) throw Error('This request is no longer pending.');
  l.transfer.state = 'Rejected';
  log(l, 'Transfer rejected', str(note));
}

export function cancelTransfer(d, { leadId }) {
  const l = getLead(d, leadId);
  if (!isPending(l) || l.transfer.from !== BDE_USER) return;
  l.transfer.state = 'Cancelled';
  log(l, 'Transfer cancelled');
}

export function rescheduleFollowUp(d, { leadId, at, note }) {
  const l = getLead(d, leadId);
  requireOwner(l);
  const t = parseFuture(at);
  if (!t) throw Error('Select a future date and time.');
  log(l, 'Follow-up rescheduled', `${fmtLocal(l.follow.at)} → ${fmtLocal(t)} · ${str(note)}`);
  l.follow.at = t;
  l.expiry = Math.max(l.expiry || 0, t + 6 * DAY);
}

export function completeFollowUp(d, { leadId, note }) {
  const l = getLead(d, leadId);
  requireOwner(l);
  finishFollow(l);
  log(l, 'Follow-up completed', str(note));
}

export function updateMeeting(d, p) {
  const l = getLead(d, p.leadId);
  requireOwner(l);
  const at = parseFuture(p.at);
  const s = str(p.step);
  if (s === 'Mark no-show' && l.appt.at > now()) throw Error('The scheduled time must pass before marking a no-show.');
  if (s === 'Reschedule meeting' && !at) throw Error('Select a future date and time.');
  if (s === 'Confirm meeting') l.appt.status = 'Confirmed';
  if (s === 'Reschedule meeting') {
    log(l, 'Previous meeting time', fmtLocal(l.appt.at));
    l.appt.at = at;
    l.appt.status = 'Rescheduled';
  }
  if (s === 'Mark no-show') l.appt.status = 'No-show';
  if (s === 'Record outcome') {
    const result = str(p.result);
    l.appt.status = result;
    if (at && result === 'Additional meeting required') {
      l.appt.at = at;
      l.appt.status = 'Rescheduled';
    } else if (at) l.follow = { at, reason: result };
    if (result === 'Not interested') Object.assign(l, { status: 'Not interested', owner: '', transfer: null, follow: null });
  }
  if (s === 'Record BAA sent') l.status = 'BAA sent';
  if (s === 'Record BAA signed') {
    Object.assign(l, { status: 'Client achieved', achieved: now(), transfer: null });
    finishFollow(l);
  }
  log(
    l,
    s === 'Record BAA sent' ? 'BAA sent' : s === 'Record BAA signed' ? 'BAA signed' : s,
    [str(p.channel), str(p.result), str(p.reason), at ? fmtLocal(at) : '', str(p.note)].filter(Boolean).join(' · '),
  );
}

/** Admin published an import batch: add its providers to the pool (skips NPIs already present). */
export function addPoolLeads(d, { rows, batch }) {
  let id = d.leads.length ? Math.max(...d.leads.map((l) => l.id)) + 1 : 0;
  for (const p of rows) {
    if (d.leads.some((l) => l.npi === p.npi)) continue;
    d.leads.push(toBdeLead(p, id++, batch));
  }
}
