export const STORAGE_KEYS = {
  // Old demo auth key. Auth is no longer persisted (token lives in memory); kept only so it can be cleaned up.
  auth: 'bluegrid-auth-v1',
  admin: 'bluegrid-admin-ui-v1',
  bde: 'bluegrid-bde-ui-v1',
};

/** Role values exactly as returned by the backend. */
export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  COMPANY_ADMIN: 'company_admin',
  SALES_EXECUTIVE: 'sales_executive',
  CLOSER: 'closer',
};

export const ROLE_LABELS = {
  platform_admin: 'Platform admin',
  company_admin: 'Company admin',
  sales_executive: 'Sales executive',
  closer: 'Closer',
};

/** Exact status strings used by the team API. */
export const TEAM_STATUSES = ['Invited', 'Active', 'Suspended', 'Revoked'];

/** Role <select> options: value is the API code, label is the UI text. */
export const AGENT_ROLE_OPTIONS = [
  { value: 'sales_executive', label: ROLE_LABELS.sales_executive },
  { value: 'closer', label: ROLE_LABELS.closer },
];

/** Lead stage strings, exactly as the API returns them. */
export const LEAD_STAGES = [
  'Available', 'Fresh', 'No response', 'Gatekeeper block', 'Wrong number', 'Callback', 'Showing interest',
  'Appointment scheduled', 'BAA sent', 'Client achieved', 'Not interested', 'Do not call', 'Admin review',
];

/** The BDE signed-in sales executive in the demo data (still dummy until the leads API is integrated). */
export const BDE_USER = 'Zack';
export const BDE_HOURLY_CLAIM_LIMIT = 50;

/** REST endpoints, relative to VITE_API_BASE_URL. Live: auth, team, settings, teamMembers, leads. The rest are planned. */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    acceptInvite: '/auth/accept-invite',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },
  team: '/admin/team',
  settings: '/admin/settings',
  teamMembers: '/team/members',
  adminOverview: '/admin/overview',
  adminLeads: '/admin/leads',
  leads: {
    filters: '/leads/filters',
    pool: '/leads/pool',
    claim: '/leads/pool/claim',
    mine: '/leads/mine',
    one: (id) => `/leads/${id}`,
  },
  adminAgents: '/admin/agents',
  bdeLeads: '/bde/leads',
  bdeFollowUps: '/bde/follow-ups',
};
