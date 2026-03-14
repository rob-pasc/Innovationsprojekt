import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin';
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and optionally role-based access.
 * If user is not authenticated, redirects to login.
 * If user lacks required role, redirects to dashboard.
 */
export default function ProtectedRoute({
  children,
  requiredRole = 'user',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
