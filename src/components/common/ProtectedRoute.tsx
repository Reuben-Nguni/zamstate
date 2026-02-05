import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = []
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-zambia-green" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <i className="fas fa-lock fa-3x text-muted mb-3"></i>
          <h4 className="text-muted">Access Denied</h4>
          <p className="text-muted">You don't have permission to access this page.</p>
          <a href="/dashboard" className="btn btn-zambia-green">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
