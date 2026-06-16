import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const userService = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  getUserPosts: (username, params) => api.get(`/users/profile/${username}/posts`, { params }),
  getUserLibrary: (username, params) => api.get(`/users/profile/${username}/library`, { params }),
  followUser: (id) => api.post(`/users/${id}/follow`),
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  getFollowers: (id) => api.get(`/users/${id}/followers`),
  getFollowing: (id) => api.get(`/users/${id}/following`),
  getActivities: (id) => api.get(`/users/${id}/activities`),
};

export const bookService = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

export const googleBooksService = {
  search: (query) => api.get('/google-books/search', { params: { query } }),
};

export const libraryService = {
  getAll: (params) => api.get('/library', { params }),
  getById: (id) => api.get(`/library/${id}`),
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

export const analyticsService = {
  getOverview: async () => api.get('/analytics'),
  getAchievements: async () => api.get('/analytics/achievements'),
  getGoals: async () => api.get('/analytics/goals'),
  createGoal: async (data) => api.post('/analytics/goals', data),
  updateGoal: async (id, data) => api.patch(`/analytics/goals/${id}`, data),
  deleteGoal: async (id) => api.delete(`/analytics/goals/${id}`),
};

export const feedService = {
  getFeed: async (params) => api.get('/feed', { params }), // { cursor, limit, type }
};

export const postService = {
  createPost: async (data) => api.post('/posts', data),
  getPost: async (id) => api.get(`/posts/${id}`),
  deletePost: async (id) => api.delete(`/posts/${id}`),
  toggleLike: async (id) => api.post(`/posts/${id}/like`),
  toggleSave: async (id) => api.post(`/posts/${id}/save`),
  getSavedPosts: async () => api.get('/posts/saved'),
  getComments: async (id) => api.get(`/posts/${id}/comments`),
  addComment: async (id, data) => api.post(`/posts/${id}/comments`, data),
  deleteComment: async (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export const uploadService = {
  uploadBookCover: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/book-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  importLibrary: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/library/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};
