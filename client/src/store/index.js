import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import themeReducer from '@/features/theme/themeSlice';
import booksReducer from '@/features/books/booksSlice';
import libraryReducer from '@/features/library/librarySlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import wishlistReducer from '@/features/wishlist/wishlistSlice';
import analyticsReducer from '@/features/analytics/analyticsSlice';
import feedReducer from '@/features/feed/feedSlice';
import postReducer from '@/features/feed/postSlice';
import notificationReducer from '@/features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    books: booksReducer,
    library: libraryReducer,
    wishlist: wishlistReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    feed: feedReducer,
    post: postReducer,
    notifications: notificationReducer,
  },
  devTools: import.meta.env.DEV,
});
