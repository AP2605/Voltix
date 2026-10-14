// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: chargingService.js
// Description: Charging session service calculating telemetry and metrics from real state.
// ============================================================================

import { mockFetch } from './api';
import { dataStore } from './dataStore';

export const chargingService = {
  async getActiveSession(userId) {
    const session = dataStore.getActiveSession(userId);
    return mockFetch(session);
  },

  async startSession(payload) {
    const session = dataStore.startChargingSession(payload);
    return mockFetch(session);
  },

  async endSession(sessionId) {
    const session = dataStore.endChargingSession(sessionId);
    return mockFetch(session);
  },

  async getChargingHistory(userId) {
    const sessions = dataStore.getSessions(userId);
    return mockFetch(sessions);
  },
};

export default chargingService;
