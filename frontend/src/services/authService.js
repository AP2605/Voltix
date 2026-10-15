// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: authService.js
// Description: Authentication service integrated with Spring Boot /api/auth.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore } from './dataStore';

export const authService = {
  async login(email, password, role) {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      if (res?.data?.token) {
        localStorage.setItem('voltix_token', res.data.token);
        localStorage.setItem('voltix_auth_user', JSON.stringify(res.data));
      }
      return res;
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('Backend unavailable, falling back to local demo store');
        const user = dataStore.loginUser(email, password, role);
        return mockFetch(user);
      }
      throw err;
    }
  },

  async register(userData) {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: userData.role || 'DRIVER',
        }),
      });
      if (res?.data?.token) {
        localStorage.setItem('voltix_token', res.data.token);
        localStorage.setItem('voltix_auth_user', JSON.stringify(res.data));
      }
      return res;
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('Backend unavailable, falling back to local demo store');
        const user = dataStore.registerUser(userData);
        return mockFetch(user);
      }
      throw err;
    }
  },

  getCurrentUser() {
    return dataStore.getCurrentUser();
  },

  async logout() {
    localStorage.removeItem('voltix_token');
    dataStore.clearCurrentUser();
    return mockFetch(true);
  },
};

export default authService;
