import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-sage-dark border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-ink-muted">Authenticating workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Strictly prevent cross-portal access, redirect to authorized dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}
