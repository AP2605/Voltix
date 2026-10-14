// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: reservationService.js
// Description: Reservation service backed by persistent user bookings.
// ============================================================================

import { mockFetch } from './api';
import { dataStore } from './dataStore';

export const reservationService = {
  async getReservations(userId) {
    const list = dataStore.getReservations(userId);
    return mockFetch(list);
  },

  async createReservation(payload) {
    const record = dataStore.createReservation(payload);
    return mockFetch(record);
  },

  async cancelReservation(id) {
    const record = dataStore.cancelReservation(id);
    return mockFetch(record);
  },
};

export default reservationService;
