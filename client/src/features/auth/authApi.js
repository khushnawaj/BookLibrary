import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services';
import { extractApiError } from '@/utils/apiError';
import { tokenStorage } from '@/services/api';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.register(payload);
      const { user, accessToken, refreshToken } = data.data;
      if (accessToken) tokenStorage.setAccess(accessToken);
      if (refreshToken) tokenStorage.setRefresh(refreshToken);
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.login(payload);
      const { user, accessToken, refreshToken } = data.data;
      if (accessToken) tokenStorage.setAccess(accessToken);
      if (refreshToken) tokenStorage.setRefresh(refreshToken);
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const guestLoginUser = createAsyncThunk(
  'auth/guestLogin',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.guestLogin();
      const { user, accessToken, refreshToken } = data.data;
      if (accessToken) tokenStorage.setAccess(accessToken);
      if (refreshToken) tokenStorage.setRefresh(refreshToken);
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (_err) {
      // Even if server logout fails, clear local tokens
    } finally {
      tokenStorage.clear();
    }
    return null;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // If no token in storage, skip the network call entirely
      const token = tokenStorage.getAccess();
      if (!token) return rejectWithValue('No token');

      const { data } = await authService.getProfile();
      return { user: data.data.user, accessToken: token };
    } catch (error) {
      tokenStorage.clear();
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.updateProfile(payload);
      return data.data.user;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);
