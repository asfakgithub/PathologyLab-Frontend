import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  roles = null, // Array of allowed roles
  fallback = '/login',
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner message="Verifying access..." />;
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && roles.length > 0 && user) {
    const hasAccess = roles.includes(user.role);
    
    if (!hasAccess) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location,
            requiredRoles: roles,
            userRole: user.role
          }} 
          replace 
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
