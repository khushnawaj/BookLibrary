import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { resetAuth, setShowGuestWarning } from '@/features/auth/authSlice';

// ── Token storage helpers ──────────────────────────────────────────────────────
const TOKEN_KEY = 'sf_access_token';
const REFRESH_KEY = 'sf_refresh_token';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  setAccess: (token) => localStorage.setItem(TOKEN_KEY, token),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setRefresh: (token) => localStorage.setItem(REFRESH_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // still send cookies when same-domain (dev)
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeRef = null;

export const injectStore = (store) => {
  storeRef = store;
};

// ── Request interceptor: attach Bearer token ───────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 with token refresh ───────────────────────
const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/logout');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Intercept guest mutations 403 Forbidden
    if (status === 403 && error.response?.data?.message?.toLowerCase().includes('guest')) {
      if (storeRef) {
        storeRef.dispatch(setShowGuestWarning(true));
      }
    }

    if (status !== 401 || originalRequest._retry || isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while refresh is in-flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(api(originalRequest)),
          reject: (err) => reject(err),
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Send refreshToken in body for cross-domain support
      const refreshToken = tokenStorage.getRefresh();
      const { data } = await api.post('/auth/refresh', { refreshToken });

      const newAccessToken = data?.data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken;

      if (newAccessToken) tokenStorage.setAccess(newAccessToken);
      if (newRefreshToken) tokenStorage.setRefresh(newRefreshToken);

      isRefreshing = false;
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      tokenStorage.clear();
      if (storeRef) storeRef.dispatch(resetAuth());
      return Promise.reject(refreshError);
    }
  }
);

export default api;
