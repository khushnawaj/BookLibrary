import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks';
import { PageLoader } from '@/components/ui/loader';
import { ROUTES } from '@/constants';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}

// Backward-compatible alias
export const PublicOnlyRoute = PublicRoute;
