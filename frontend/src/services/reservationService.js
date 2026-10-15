// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: reservationService.js
// Description: Reservation service integrated with Spring Boot /api/reservations.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore } from './dataStore';

export const reservationService = {
  async getReservations(userId) {
    try {
      return await apiRequest('/reservations');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const list = dataStore.getReservations(userId);
        return mockFetch(list);
      }
      throw err;
    }
  },

  async createReservation(payload) {
    try {
      return await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const record = dataStore.createReservation(payload);
        return mockFetch(record);
      }
      throw err;
    }
  },

  async cancelReservation(id) {
    try {
      return await apiRequest(`/reservations/${id}/cancel`, {
        method: 'POST',
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const record = dataStore.cancelReservation(id);
        return mockFetch(record);
      }
      throw err;
    }
  },
};

export default reservationService;
