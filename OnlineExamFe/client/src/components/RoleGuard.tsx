import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Logged in but not authorized
    // Redirect to home or a "not authorized" page
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <>{children}</>;
};

export default RoleGuard;
