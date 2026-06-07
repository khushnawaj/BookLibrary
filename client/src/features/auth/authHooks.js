import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
} from './authApi';
import { clearAuthError } from './authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, accessToken, isAuthenticated, loading, error, initialized } =
    useAppSelector((state) => state.auth);

  const register = useCallback(
    async (data) => {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        toast.success('Welcome to BookVerse!');
        navigate(ROUTES.DASHBOARD);
        return { success: true };
      }
      return { success: false, error: result.payload };
    },
    [dispatch, navigate]
  );

  const login = useCallback(
    async (data) => {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Welcome back!');
        navigate(ROUTES.DASHBOARD);
        return { success: true };
      }
      return { success: false, error: result.payload };
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const bootstrapAuth = useCallback(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    error,
    initialized,
    register,
    login,
    logout,
    bootstrapAuth,
    dismissError,
  };
};
