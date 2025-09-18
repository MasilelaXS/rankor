import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingPage } from '../components/ui/Loading';
import { useTokenValidation } from '../hooks/useTokenValidation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'technician';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();
  
  // Initialize token validation (handles automatic logout on token expiration)
  useTokenValidation();

  if (isLoading) {
    return <LoadingPage message="Verifying authentication..." />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login with the current location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.user_type !== requiredRole) {
    // Redirect to their appropriate dashboard
    const redirectPath = user.user_type === 'admin' ? '/admin' : '/technician';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    // Redirect authenticated users to their dashboard
    const redirectPath = user.user_type === 'admin' ? '/admin' : '/technician';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};