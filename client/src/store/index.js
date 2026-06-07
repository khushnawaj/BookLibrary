import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import booksReducer from '@/features/books/booksSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import wishlistReducer from '@/features/wishlist/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    wishlist: wishlistReducer,
    dashboard: dashboardReducer,
  },
  devTools: import.meta.env.DEV,
});
