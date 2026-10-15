// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: stationService.js
// Description: Station service integrated with Spring Boot /api/stations.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore, CITIES } from './dataStore';

export const stationService = {
  async getStations(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.cityId) params.append('cityId', filters.cityId);
      if (filters.connectorType) params.append('connectorType', filters.connectorType);
      if (filters.speedCategory) params.append('speedCategory', filters.speedCategory);
      if (filters.availableOnly) params.append('availableOnly', filters.availableOnly);

      const qs = params.toString() ? `?${params.toString()}` : '';
      return await apiRequest(`/stations${qs}`);
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const list = dataStore.getStations(filters);
        return mockFetch(list);
      }
      throw err;
    }
  },

  async getStationById(id) {
    try {
      return await apiRequest(`/stations/${id}`);
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const station = dataStore.getStationById(id);
        if (!station) {
          throw new Error(`Station #${id} not found`);
        }
        return mockFetch(station);
      }
      throw err;
    }
  },

  async getNearbyStations(limit = 3) {
    try {
      return await apiRequest(`/stations/nearby?limit=${limit}`);
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const all = dataStore.getStations();
        const sorted = [...all].sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        return mockFetch(sorted.slice(0, limit));
      }
      throw err;
    }
  },

  async getCities() {
    try {
      return await apiRequest('/cities');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        return mockFetch(CITIES);
      }
      throw err;
    }
  },
};

export default stationService;
