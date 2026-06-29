export const APP_NAME = 'ShelfForge';
export const APP_TAGLINE = 'Forge your personal library';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LIBRARY: '/library',
  FEED: '/feed',
  LIBRARY_ADD: '/library/add',
  LIBRARY_BOOK: '/library/:id',
  LIBRARY_EDIT: '/library/:id/edit',
  LIBRARY_IMPORT: '/library/import',
  ANALYTICS: '/analytics',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  FEEDBACK: '/feedback',
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

export {
  THEME_MODES,
  THEME_PALETTES,
  DEFAULT_THEME,
  PALETTE_META,
  THEME_TOKENS,
} from './themes';
