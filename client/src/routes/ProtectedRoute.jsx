import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * Placeholder — wired with auth state in Step 3.
 * Currently allows all private routes for foundation testing.
 */
export function ProtectedRoute({ children }) {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
