import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';
import { adminRoutes, platformRoutes, bdeRoutes, homeFor } from './config';
import { AdminLayout, PlatformLayout, BdeLayout } from '../components/Layout/PortalLayouts';
import Login from '../panel/Authentication/Login';
import { useAuthStore } from '../store/features/auth/useAuthStore';

const renderRoutes = (routes) =>
  routes.map(({ path, Page }) =>
    path ? <Route key={path} path={path} element={<Page />} /> : <Route key="index" index element={<Page />} />,
  );

export default function AppRouter() {
  const user = useAuthStore((s) => s.user);
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<PrivateRoutes role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>{renderRoutes(adminRoutes)}</Route>
        <Route path="/platform" element={<PlatformLayout />}>{renderRoutes(platformRoutes)}</Route>
      </Route>

      <Route element={<PrivateRoutes role="bde" />}>
        <Route path="/bde" element={<BdeLayout />}>{renderRoutes(bdeRoutes)}</Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  );
}
