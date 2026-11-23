import { ROLES } from '../../constant';

/** Use with the store:  const role = useAuthStore(selectRole) */
export const selectRole = (s) => s.user?.role ?? null;
export const selectIsPlatformAdmin = (s) => s.user?.role === ROLES.PLATFORM_ADMIN;
export const selectIsCompanyAdmin = (s) => s.user?.role === ROLES.COMPANY_ADMIN;
export const selectIsSales = (s) => s.user?.role === ROLES.SALES_EXECUTIVE || s.user?.role === ROLES.CLOSER;
export const selectTenantName = (s) => s.user?.tenant?.name ?? null;
