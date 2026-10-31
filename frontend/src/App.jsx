import React from 'react';
import Workspace from './portals/workspace/Workspace';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminPortalWrapper from './portals/AdminPortalWrapper';
import StaffPortalWrapper from './portals/StaffPortalWrapper';
import CustomerPortalWrapper from './portals/CustomerPortalWrapper';

function RootRedirect() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-sage-dark border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-ink-muted">Loading workspace...</p>
      </div>
    );
  }

  if (user && user.role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Entry Point: Redirects to /login (or dashboard if already authenticated) */}
          <Route path="/" element={<RootRedirect />} />

          {/* Preview Routes for Admin & Staff Workspace */}
          <Route path="/preview/admin" element={<Workspace role="admin" preview />} />
          <Route path="/preview/staff" element={<Workspace role="staff" preview />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Optional Landing Page view preserved */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Role-Protected Portals */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortalWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffPortalWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/*"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerPortalWrapper />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
