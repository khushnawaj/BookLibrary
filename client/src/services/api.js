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
  url.includes('/auth/me');

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !isAuthEndpoint(url) && storeRef) {
      storeRef.dispatch(resetAuth());
    }

    return Promise.reject(error);
  }
);

export default api;
