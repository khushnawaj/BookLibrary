export const APP_NAME = 'BookVerse';
export const APP_TAGLINE = 'Your universe of stories';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LIBRARY: '/library',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const SHELF_TYPES = {
  READ: 'READ',
  READING: 'READING',
  WISHLIST: 'WISHLIST',
  DROPPED: 'DROPPED',
};

export const STORAGE_KEYS = {
  THEME: 'bookverse_theme',
};
