// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: authService.js
// Description: Authentication service backed by persistent user records.
// ============================================================================

import { mockFetch } from './api';
import { dataStore } from './dataStore';

export const authService = {
  async login(email, password, role) {
    const user = dataStore.loginUser(email, password, role);
    return mockFetch(user);
  },

  async register(userData) {
    const user = dataStore.registerUser(userData);
    return mockFetch(user);
  },

  getCurrentUser() {
    return dataStore.getCurrentUser();
  },

  async logout() {
    dataStore.clearCurrentUser();
    return mockFetch(true);
  },
};

export default authService;
