import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthInitializer } from '@/app/AuthInitializer';
import { MainLayout } from '@/components/layout/MainLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ROUTES } from '@/constants';
import AddBookPage from '@/pages/AddBookPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import BookDetailsPage from '@/pages/BookDetailsPage';
import DashboardPage from '@/pages/DashboardPage';
import EditBookPage from '@/pages/EditBookPage';
import FeedPage from '@/pages/FeedPage';
import ImportBooksPage from '@/pages/ImportBooksPage';
import LandingPage from '@/pages/LandingPage';
import LibraryPage from '@/pages/LibraryPage';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import PublicBookPage from '@/pages/PublicBookPage';
import RegisterPage from '@/pages/RegisterPage';
import SettingsPage from '@/pages/SettingsPage';
import WishlistPage from '@/pages/WishlistPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminDashboard from '@/pages/AdminDashboard';
import { ProtectedRoute, PublicRoute, AdminRoute } from '@/routes/ProtectedRoute';

function RootLayout() {
  return (
    <AuthInitializer>
      <Outlet />
    </AuthInitializer>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: ROUTES.HOME, element: <LandingPage /> },
          {
            path: ROUTES.LOGIN,
            element: (
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            ),
          },
          {
            path: ROUTES.REGISTER,
            element: (
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            ),
          },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.FEED, element: <FeedPage /> },
          { path: ROUTES.LIBRARY, element: <LibraryPage /> },
          { path: ROUTES.LIBRARY_ADD, element: <AddBookPage /> },
          { path: ROUTES.LIBRARY_IMPORT, element: <ImportBooksPage /> },
          { path: ROUTES.LIBRARY_BOOK, element: <BookDetailsPage /> },
          { path: ROUTES.LIBRARY_EDIT, element: <EditBookPage /> },
          { path: '/books/:id', element: <PublicBookPage /> },
          { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
          { path: ROUTES.WISHLIST, element: <WishlistPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: `${ROUTES.PROFILE}/:username`, element: <ProfilePage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          {
            path: ROUTES.ADMIN,
            element: (
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            ),
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
