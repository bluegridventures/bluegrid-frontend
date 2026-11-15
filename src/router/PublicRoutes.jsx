import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/features/auth/useAuthStore';
import { homeFor } from './config';

/** Redirects signed-in users away from public pages such as /login. */
export default function PublicRoutes() {
  const user = useAuthStore((s) => s.user);
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Outlet />;
}
