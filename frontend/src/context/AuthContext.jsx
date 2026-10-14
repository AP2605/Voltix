// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: AuthContext.jsx
// Description: Authentication state provider backed by real user accounts.
// ============================================================================

import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(currentUser);
  const role = currentUser?.role || 'GUEST';

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password, role);
      setCurrentUser(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setCurrentUser(response.data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    role,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
