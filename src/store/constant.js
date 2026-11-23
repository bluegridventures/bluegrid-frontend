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

/** The BDE signed-in sales executive in the demo data (still dummy until the leads API is integrated). */
export const BDE_USER = 'Zack';
export const BDE_HOURLY_CLAIM_LIMIT = 50;

/** REST endpoints, relative to VITE_API_BASE_URL. Only `auth` is live; the rest are planned. */
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
  adminOverview: '/admin/overview',
  adminLeads: '/admin/leads',
  adminAgents: '/admin/agents',
  bdeLeads: '/bde/leads',
  bdeFollowUps: '/bde/follow-ups',
};
