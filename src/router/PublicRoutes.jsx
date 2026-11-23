import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/features/auth/useAuthStore';
import FullPageLoader from '../components/Auth/FullPageLoader';
import { homeFor } from './config';

/** Redirects signed-in users away from /login and /forgot-password. */
export default function PublicRoutes() {
  const { user, isInitializing } = useAuthStore();
  if (isInitializing) return <FullPageLoader />;
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Outlet />;
}
