export const STORAGE_KEYS = {
  auth: 'bluegrid-auth-v1',
  admin: 'bluegrid-admin-ui-v1',
  bde: 'bluegrid-bde-ui-v1',
};

export const ROLES = { ADMIN: 'admin', BDE: 'bde' };

/** The BDE signed-in sales executive in the demo data. */
export const BDE_USER = 'Zack';
export const BDE_HOURLY_CLAIM_LIMIT = 50;

/** Planned REST endpoints (Node.js + MongoDB). Unused while the UI runs on dummy data. */
export const ENDPOINTS = {
  login: '/auth/login',
  adminOverview: '/admin/overview',
  adminLeads: '/admin/leads',
  adminAgents: '/admin/agents',
  bdeLeads: '/bde/leads',
  bdeFollowUps: '/bde/follow-ups',
};
