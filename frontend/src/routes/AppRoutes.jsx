// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: AppRoutes.jsx
// Description: React Router definition with role-based route guards and app layouts.
// ============================================================================

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Components
import Navbar from '../components/Navbar';

// Pages
import Landing from '../pages/Landing';
import Auth from '../pages/Auth';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Stations from '../pages/Stations';
import StationDetails from '../pages/StationDetails';
import Reservation from '../pages/Reservation';
import ChargingSession from '../pages/ChargingSession';
import Payment from '../pages/Payment';
import History from '../pages/History';
import Wallet from '../pages/Wallet';
import Profile from '../pages/Profile';
import OperatorDashboard from '../pages/OperatorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

// Role Guard Component
function RoleRoute({ children, allowedRoles }) {
  const { currentUser, role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not authorized for operator or admin, fallback to standard user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Layout wrapper for authenticated pages that includes top Navbar
function AppLayout({ children }) {
  return (
    <div className="main-content">
      <Navbar />
      {children}
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth defaultMode="login" />} />
      <Route path="/register" element={<Auth defaultMode="register" />} />

      {/* Driver / Consumer Routes */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/stations"
        element={
          <RoleRoute>
            <AppLayout>
              <Stations />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/stations/:id"
        element={
          <RoleRoute>
            <AppLayout>
              <StationDetails />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/reservation/:stationId"
        element={
          <RoleRoute>
            <AppLayout>
              <Reservation />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/charging"
        element={
          <RoleRoute>
            <AppLayout>
              <ChargingSession />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/payment/:sessionId"
        element={
          <RoleRoute>
            <AppLayout>
              <Payment />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/history"
        element={
          <RoleRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <RoleRoute>
            <AppLayout>
              <Wallet />
            </AppLayout>
          </RoleRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RoleRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </RoleRoute>
        }
      />

      {/* Operator Portal Route */}
      <Route
        path="/operator"
        element={
          <RoleRoute allowedRoles={['OPERATOR', 'ADMIN']}>
            <AppLayout>
              <OperatorDashboard />
            </AppLayout>
          </RoleRoute>
        }
      />

      {/* Admin Portal Route */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </RoleRoute>
        }
      />

      {/* Fallback to Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
