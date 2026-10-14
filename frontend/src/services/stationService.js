// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: stationService.js
// Description: Station service backed by real station inventory and dynamic bay status.
// ============================================================================

import { mockFetch } from './api';
import { dataStore, CITIES } from './dataStore';

export const stationService = {
  async getStations(filters = {}) {
    const list = dataStore.getStations(filters);
    return mockFetch(list);
  },

  async getStationById(id) {
    const station = dataStore.getStationById(id);
    if (!station) {
      throw new Error(`Station #${id} not found`);
    }
    return mockFetch(station);
  },

  async getNearbyStations(limit = 3) {
    const all = dataStore.getStations();
    const sorted = [...all].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    return mockFetch(sorted.slice(0, limit));
  },

  async getCities() {
    return mockFetch(CITIES);
  },
};

export default stationService;
