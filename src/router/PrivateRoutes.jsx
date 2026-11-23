import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/features/auth/useAuthStore';
import FullPageLoader from '../components/Auth/FullPageLoader';
import { homeFor } from './config';

/** Only lets signed-in users with one of `roles` through. Remembers the target path for after login. */
export default function PrivateRoutes({ roles }) {
  const { user, isInitializing } = useAuthStore();
  const location = useLocation();
  if (isInitializing) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
