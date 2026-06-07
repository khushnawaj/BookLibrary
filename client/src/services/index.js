import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/me'),
};

export const bookService = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const libraryService = {
  getAll: (params) => api.get('/library', { params }),
  add: (data) => api.post('/library', data),
  update: (id, data) => api.put(`/library/${id}`, data),
  remove: (id) => api.delete(`/library/${id}`),
};

export const wishlistService = {
  add: (bookId) => api.post('/library/wishlist', { bookId }),
  remove: (bookId) => api.delete(`/library/wishlist/${bookId}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};
