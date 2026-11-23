import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';
import { adminRoutes, platformRoutes, bdeRoutes, homeFor } from './config';
import { AdminLayout, PlatformLayout, BdeLayout } from '../components/Layout/PortalLayouts';
import Login from '../panel/Authentication/Login';
import ForgotPassword from '../panel/Authentication/ForgotPassword';
import ResetPassword from '../panel/Authentication/ResetPassword';
import AcceptInvite from '../panel/Authentication/AcceptInvite';
import { useAuthStore } from '../store/features/auth/useAuthStore';
import { ROLES } from '../store/constant';

const renderRoutes = (routes) =>
  routes.map(({ path, Page }) =>
    path ? <Route key={path} path={path} element={<Page />} /> : <Route key="index" index element={<Page />} />,
  );

export default function AppRouter() {
  const user = useAuthStore((s) => s.user);
  const initialize = useAuthStore((s) => s.initialize);

  // App startup: refresh cookie -> access token -> /auth/me (runs once, shows a loader meanwhile)
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Email links: always reachable, even if another user is signed in on this browser */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      <Route element={<PrivateRoutes roles={[ROLES.COMPANY_ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>{renderRoutes(adminRoutes)}</Route>
      </Route>

      <Route element={<PrivateRoutes roles={[ROLES.PLATFORM_ADMIN]} />}>
        <Route path="/platform" element={<PlatformLayout />}>{renderRoutes(platformRoutes)}</Route>
      </Route>

      <Route element={<PrivateRoutes roles={[ROLES.SALES_EXECUTIVE, ROLES.CLOSER]} />}>
        <Route path="/bde" element={<BdeLayout />}>{renderRoutes(bdeRoutes)}</Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  );
}
