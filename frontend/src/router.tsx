import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OnboardingPage from '@/pages/auth/OnboardingPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AlertPage from '@/pages/alert/AlertPage';
import InvestigationPage from '@/pages/investigation/InvestigationPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/routing/ProtectedRoute';

/**
 * App Router Configuration
 * 
 * Structure:
 * - Public routes: /, /login, /register
 * - Protected routes: /onboarding, /dashboard, /alert/:token
 * - Catch-all: 404
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'alert/:token',
        element: <AlertPage />,
      },

      // Protected Routes
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'investigation/:token',
        element: (
          <ProtectedRoute>
            <InvestigationPage />
          </ProtectedRoute>
        ),
      },

      // Catch-all for undefined routes
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);