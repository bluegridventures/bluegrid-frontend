// Dummy data + constants used by the frontend-only phase.
// Once the API exists, seeds are replaced by responses from src/store/features/*/…Fns.js
import { DAY, HOUR, now } from './utils';

export const SPECIALTIES = ['Clinical social work', 'Psychiatry', 'Counseling'];
export const AGENT_ROLES = ['Sales executive', 'Closer'];
export const ADMIN_PERIODS = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'All Time'];
export const ADMIN_METRIC_KEYS = ['Dials', 'Connected', 'Appointments', 'BAA sent', 'Clients achieved'];
export const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Asia/Karachi', 'UTC'];
export const MEETING_UPDATES = [
  'Confirmed by phone',
  'Confirmed by email',
  'Calendar accepted',
  'Rescheduled',
  'No-show',
  'Follow-up required',
  'Proposal sent',
  'Decision pending',
  'Additional meeting required',
  'Move to onboarding',
];
export const MEETING_NEEDS_TIME = ['Rescheduled', 'Additional meeting required', 'Follow-up required'];
export const ADMIN_SERVICES = ['Credentialing', 'Medical billing', 'RCM audit'];

export const BDE_PERIODS = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'All time'];
export const CALL_OUTCOMES = [
  'No response',
  'Gatekeeper block',
  'Wrong number',
  'Do not call',
  'Not interested',
  'Showing interest',
  'Callback',
  'Appointment scheduled',
];
export const BDE_SERVICES = ['Medical billing', 'Credentialing', 'RCM audit', 'State licensing'];
export const NOT_INTERESTED_REASONS = [
  'In-house biller',
  'Already outsourced',
  'Bad timing',
  'Hard no',
  'Price objection',
  'Already credentialed',
  'Other',
];
export const MEETING_OUTCOMES = [
  'Follow-up required',
  'Proposal sent',
  'Decision pending',
  'Additional meeting required',
  'Not interested',
  'Move to onboarding',
];

/* ------------------------------------------------------------------ */
/* Admin seed                                                          */
/* ------------------------------------------------------------------ */
export function createAdminSeed() {
  const t = now();
  const agents = ['Zack', 'Maya', 'Moe'].map((name, i) => ({
    id: i + 1,
    name,
    email: name.toLowerCase() + '@example.test',
    phone: '',
    role: AGENT_ROLES[i === 1 ? 1 : 0],
    quota: 50,
    status: 'Active',
  }));
  const names = [
    'Juniper Bridge Therapy', 'Alder Grove Counseling', 'Harbor Elm Psychiatry', 'Cedarline Behavioral',
    'Linden Path Care', 'Cove Hill Counseling', 'Willow Field Therapy', 'Birch Hollow Wellness',
    'Meadowline Counseling', 'Silver Fern Psychiatry', 'Aspen Leaf Therapy', 'Cypress Ridge Care',
  ];
  const stages = [
    'Callback', 'Showing interest', 'Appointment', 'BAA sent', 'Client achieved', 'Available',
    'Available', 'Do not call', 'Admin review', 'Fresh', 'Client achieved', 'Available',
  ];
  const owners = [1, 1, 2, 2, 2, 0, 0, 0, 0, 3, 1, 0];
  const leads = names.map((name, i) => ({
    id: i + 1,
    npi: String(9000000100 + i),
    name,
    specialty: SPECIALTIES[i % 3],
    stage: stages[i],
    owner: owners[i],
    state: ['WA', 'TX', 'NY', 'OR'][i % 4],
    score: 94 - i,
    phone: '(202) 555-' + String(100 + i).padStart(4, '0'),
    due: i < 2 ? t + (i ? 3 : -1) * HOUR : null,
  }));
  const events = [];
  for (let d = 0; d < 55; d++) {
    for (let j = 0; j < 12 + ((d * 3) % 13); j++) {
      const a = agents[(d + j) % 3];
      events.push({
        at: t - d * DAY - j * 93000,
        actor: a.name,
        agent: a.id,
        lead: 1 + (j % 5),
        type: 'Dial',
        note: j % 3 ? 'No response' : 'Connected',
        connected: j % 3 === 0,
      });
    }
  }
  for (const [lead, type] of [[3, 'Appointment set'], [4, 'BAA sent'], [5, 'Client achieved'], [11, 'Client achieved']]) {
    events.unshift({
      at: t - HOUR * lead,
      actor: 'Maya',
      agent: leads[lead - 1].owner,
      lead,
      type,
      note: 'Recorded in the sample pipeline.',
    });
  }
  return {
    name: 'NorthGate Billing',
    zone: 'America/New_York',
    quota: 50,
    agents,
    leads,
    events,
    imports: [],
    rules: { allow: SPECIALTIES.slice(), min: 70 },
    transfers: [{ id: 1, lead: 2, from: 1, to: 2, status: 'Pending', reason: 'Review direct payer enrollment options.' }],
    meetings: [
      { id: 1, lead: 3, at: t + DAY, status: 'Pending confirmation', owner: 2, participants: 'Zack', link: 'https://example.test/meeting', note: 'Review payer applications.' },
    ],
    clients: [
      { lead: 5, signed: t - DAY, contract: true, invoice: 790, paid: false, work: false },
      { lead: 11, signed: t - 3 * DAY, contract: false, invoice: null, paid: false, work: false },
    ],
    tenants: [
      { id: 1, name: 'NorthGate Billing', slug: 'northgate', email: 'admin@example.test', plan: 'Growth', seats: 12, status: 'Active', storage: 20, limit: 8 },
      { id: 2, name: 'Cobalt Revenue Group', slug: 'cobalt', email: 'ops@example.test', plan: 'Pilot', seats: 5, status: 'Trial', storage: 10, limit: 4 },
    ],
    plans: [
      { name: 'Pilot', setup: 200, monthly: 79 },
      { name: 'Growth', setup: 500, monthly: 199 },
    ],
    ledger: [],
    platformName: 'Bluegrid Ventures',
  };
}

/* ------------------------------------------------------------------ */
/* BDE seed                                                            */
/* ------------------------------------------------------------------ */
export function createBdeSeed() {
  const names = [
    'Alder Grove Counseling', 'Mira Lane, LCSW', 'Cedarline Psychiatry', 'Juniper Bridge Therapy',
    'Moss Creek Counseling', 'Ellis Vale, LPC', 'Silver Fern Wellness', 'Linden Path Behavioral',
    'Cove Hill Psychology', 'Aspen Leaf Therapy', 'Rowan Park, LMFT', 'Harbor Elm Counseling',
    'Birch Hollow Wellness', 'Ivy Brook Therapy', 'Cypress Ridge Behavioral', 'Riverbend Mind Care', 'Sage Hill Psychiatry',
  ];
  const locations = [
    ['Seattle', 'WA', 'America/Los_Angeles'],
    ['Austin', 'TX', 'America/Chicago'],
    ['Albany', 'NY', 'America/New_York'],
    ['Denver', 'CO', 'America/Denver'],
  ];
  const assigned = ['Callback', 'Showing interest', 'Fresh', 'Appointment scheduled', 'BAA sent', 'Showing interest', 'Fresh', 'Showing interest', 'Client achieved'];
  const leads = names.map((name, id) => {
    const [city, state, tz] = locations[id % 4];
    const status = assigned[id] || 'Available';
    const owner = id < 6 || id === 8 ? 'Zack' : id === 6 ? 'Moe' : id === 7 ? 'Maya' : '';
    const phone = '(202) 555-' + String(100 + id).padStart(4, '0');
    const past = now() - ((id % 4) + 1) * DAY;
    const appt =
      id === 3 || id === 4
        ? {
            at: id === 3 ? now() + DAY : past,
            status: id === 3 ? 'Pending confirmation' : 'Meeting completed',
            link: 'https://example.test/meeting',
            email: 'office@example.test',
            participants: ['Maya'],
            comment: 'Review payer enrollment options.',
          }
        : null;
    return {
      id,
      name,
      state,
      tz,
      city,
      npi: '90000000' + String(id).padStart(2, '0'),
      type: name.includes(',') ? 'Individual' : 'Organization',
      enum: past - 12 * DAY,
      specialty: ['Clinical social work', 'Professional counseling', 'Psychiatry', 'Family therapy'][id % 4],
      score: 94 - id,
      phones: [{ value: phone, source: 'Sample practice listing', ok: true }],
      owner,
      status,
      attempts: owner && status !== 'Fresh' ? 1 : 0,
      claimed: owner ? past : null,
      expiry: owner && !appt && id !== 8 ? now() + 3 * DAY : null,
      services: owner ? ['Credentialing'] : [],
      follow:
        id < 2
          ? { at: id === 0 ? now() - HOUR : now() + 2 * HOUR, reason: id === 0 ? 'Return requested call' : 'Discuss payer applications', done: false }
          : null,
      completed: [],
      appt,
      transfer:
        id === 6
          ? { from: 'Moe', to: 'Zack', state: 'Pending', reason: 'Follow up on credentialing', note: 'Provider requested a call this week.' }
          : id === 7
            ? { from: 'Zack', to: 'Maya', state: 'Accepted', reason: 'Closing support', note: 'Interested in direct payer contracts.' }
            : null,
      achieved: id === 8 ? past : null,
      history: owner ? [{ at: past, by: owner, label: 'Lead assigned', note: 'Sample assignment' }] : [],
      email: appt?.email || '',
      shares: [],
    };
  });

  // historical demo activity for the dashboard
  const calls = [];
  const pool = leads.filter((l) => l.owner === 'Zack' && l.status !== 'Fresh');
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < [9, 14, 11, 17, 12, 8, 6][i]; j++) {
      const l = pool[j % pool.length];
      const connected = j % 3 === 0;
      calls.push({ at: now() - (6 - i) * DAY - (j + 1) * 60000, id: l.id, phone: l.phones[0].value, outcome: connected ? 'Callback' : 'No response', connected });
    }
  }
  for (const l of pool) {
    l.attempts = calls.filter((e) => e.id === l.id).length;
    l.history.push({ at: l.claimed, by: 'Zack', label: 'Sample outreach', note: 'Historical demo calls are included in the dashboard.' });
    if (l.appt) l.history.unshift({ at: l.claimed + HOUR, by: 'Zack', label: 'Appointment scheduled', note: l.appt.comment });
    if (l.status === 'BAA sent') l.history.unshift({ at: l.claimed + 2 * HOUR, by: 'Zack', label: 'BAA sent', note: 'Awaiting signature.' });
    if (l.achieved) l.history.unshift({ at: l.achieved, by: 'Zack', label: 'BAA signed', note: 'Client achieved.' });
  }
  return { leads, calls, claims: [] };
}
