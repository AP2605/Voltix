// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: chargingService.js
// Description: Charging session service integrated with Spring Boot /api/charging-sessions.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore } from './dataStore';

export const chargingService = {
  async getActiveSession(userId) {
    try {
      return await apiRequest('/charging-sessions/active');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const session = dataStore.getActiveSession(userId);
        return mockFetch(session);
      }
      throw err;
    }
  },

  async startSession(payload) {
    try {
      return await apiRequest('/charging-sessions/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const session = dataStore.startChargingSession(payload);
        return mockFetch(session);
      }
      throw err;
    }
  },

  async endSession(sessionId) {
    try {
      return await apiRequest(`/charging-sessions/${sessionId}/stop`, {
        method: 'POST',
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const session = dataStore.endChargingSession(sessionId);
        return mockFetch(session);
      }
      throw err;
    }
  },

  async getSessionById(sessionId) {
    try {
      return await apiRequest(`/charging-sessions/${sessionId}`);
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const sessions = dataStore.getSessions ? dataStore.getSessions() : [];
        const found = sessions.find((s) => s.sessionId === Number(sessionId));
        return mockFetch(found);
      }
      throw err;
    }
  },

  async getChargingHistory(userId) {
    try {
      return await apiRequest('/charging-sessions');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const sessions = dataStore.getSessions(userId);
        return mockFetch(sessions);
      }
      throw err;
    }
  },
};

export default chargingService;
