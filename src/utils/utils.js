export const DAY = 86400000;
export const HOUR = 3600000;
export const now = () => Date.now();
export const cn = (...c) => c.filter(Boolean).join(' ');

/** Format a timestamp in a given IANA zone (admin console, tenant time). */
export const fmtZone = (t, zone) =>
  t
    ? new Date(t).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: zone,
        timeZoneName: 'short',
      })
    : '—';

/** Format a timestamp in the browser's local time (BDE workspace). */
export const fmtLocal = (t) =>
  t ? new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export const fmtDate = (t) => new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' });
export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
export const str = (v) => String(v ?? '').trim();
export const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
export const matchText = (parts, q) => parts.join(' ').toLowerCase().includes(q.toLowerCase());
export const agentName = (agents, id) => agents.find((a) => String(a.id) === String(id))?.name || 'Unassigned';

/** Convert a <form> into a plain payload. Keys listed in `arrays` are always arrays. */
export function formToPayload(form, arrays = []) {
  const out = {};
  for (const [k, v] of new FormData(form).entries()) {
    out[k] = k in out ? [].concat(out[k], v) : v;
  }
  arrays.forEach((k) => {
    out[k] = [].concat(out[k] ?? []);
  });
  return out;
}

/** Parse a datetime-local value; throws if it is not in the future. */
export function parseFuture(value, message = 'Select a future date and time.') {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (!Number.isFinite(t) || t <= now()) throw Error(message);
  return t;
}

/**
 * Admin reporting windows in the tenant's timezone (DST-safe).
 * Returns [[start, end], [prevStart, prevEnd]].
 */
export function getPeriodBounds(period, zone) {
  const wall = (t) => {
    const x = Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      })
        .formatToParts(t)
        .map((p) => [p.type, p.value]),
    );
    return Date.UTC(+x.year, x.month - 1, +x.day, +x.hour, +x.minute, +x.second);
  };
  const n = now();
  const w = wall(n);
  const d = new Date(w);
  const today = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const week = today - ((d.getUTCDay() + 6) % 7) * DAY;
  const month = (k) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + k, 1);
  let a, b, c, e;
  if (period === 'All Time') return [[0, n + 1], [0, 0]];
  if (period.includes('Month')) {
    const cur = period === 'This Month';
    a = cur ? month(0) : month(-1);
    b = cur ? w : month(0);
    c = cur ? month(-1) : month(-2);
    e = cur ? Math.min(a, c + b - a) : a;
  } else {
    const span = period.includes('Week') ? 7 * DAY : DAY;
    const start = span === DAY ? today : week;
    const past = ['Last Week', 'Yesterday'].includes(period);
    a = start - (past ? span : 0);
    b = past ? start : w;
    c = a - span;
    e = c + b - a;
  }
  const utc = (x) => {
    let g = x;
    for (let i = 0; i < 3; i++) g += x - wall(g);
    return g;
  };
  return [[utc(a), b === w ? n + 1 : utc(b)], [utc(c), utc(e)]];
}

/** [Dials, Connected, Appointments, BAA sent, Clients achieved] for a list of events. */
export function countEvents(ev) {
  return [
    ev.filter((e) => e.type === 'Dial').length,
    ev.filter((e) => e.type === 'Dial' && e.connected).length,
    ...['Appointment set', 'BAA sent', 'Client achieved'].map((t) => ev.filter((e) => e.type === t).length),
  ];
}

/** BDE dashboard window (browser-local time). */
export function getBdeRange(period) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let lo = start.getTime();
  let hi = now();
  if (period === 'Yesterday') {
    hi = lo;
    lo -= DAY;
  } else if (period === 'Last 7 days') lo -= 6 * DAY;
  else if (period === 'Last 30 days') lo -= 29 * DAY;
  else if (period === 'All time') lo = 0;
  return [lo, hi];
}
