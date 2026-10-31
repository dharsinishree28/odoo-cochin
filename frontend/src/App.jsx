import React from 'react';
import Workspace from './portals/workspace/Workspace';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import AdminPortalWrapper from './portals/AdminPortalWrapper';
import StaffPortalWrapper from './portals/StaffPortalWrapper';
import CustomerPortalWrapper from './portals/CustomerPortalWrapper';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/preview/admin" element={<Workspace role="admin" preview />} />
          <Route path="/preview/staff" element={<Workspace role="staff" preview />} />
          {/* Public Website */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
