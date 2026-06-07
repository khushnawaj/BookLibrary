import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services';
import { extractApiError } from '@/utils/apiError';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.register(payload);
      return data.data.user;
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
      return data.data.user;
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
      return null;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.getProfile();
      return data.data.user;
    } catch (error) {
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
