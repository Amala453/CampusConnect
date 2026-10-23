import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>403 - Access Forbidden</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          You do not have the required permissions to view this dashboard. Your role is: <strong>{user?.role}</strong>.
        </p>
        <a href="/" className="btn btn-primary">
          Return to Home
        </a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
