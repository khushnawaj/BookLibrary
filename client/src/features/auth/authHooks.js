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
  guestLoginUser,
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
        toast.success('Welcome to ShelfForge!');
        navigate(ROUTES.FEED);
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
        navigate(ROUTES.FEED);
        return { success: true };
      }
      return { success: false, error: result.payload };
    },
    [dispatch, navigate]
  );

  const guestLogin = useCallback(
    async () => {
      const result = await dispatch(guestLoginUser());
      if (guestLoginUser.fulfilled.match(result)) {
        toast.success('Browsing in Guest Mode!');
        navigate(ROUTES.FEED);
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
    guestLogin,
    logout,
    bootstrapAuth,
    dismissError,
  };
};
