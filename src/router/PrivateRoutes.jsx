import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/features/auth/useAuthStore';
import { homeFor } from './config';

/** Only lets signed-in users with the matching role through. */
export default function PrivateRoutes({ role }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
