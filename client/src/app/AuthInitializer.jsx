import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchCurrentUser } from '@/features/auth/authApi';
import { PageLoader } from '@/components/ui/loader';

export function AuthInitializer({ children }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!initialized) {
    return <PageLoader />;
  }

  return children;
}
