import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { resetAuth } from '@/features/auth/authSlice';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeRef = null;

export const injectStore = (store) => {
  storeRef = store;
};

const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/refresh') ||
  url.includes('/auth/logout');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Don't intercept auth endpoints or already-retried requests
    if (status !== 401 || originalRequest._retry || isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is in-flight
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
      await api.post('/auth/refresh');
      isRefreshing = false;
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      // Refresh failed — clear auth state and redirect to login
      if (storeRef) {
        storeRef.dispatch(resetAuth());
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
