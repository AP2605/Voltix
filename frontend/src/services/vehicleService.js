// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: vehicleService.js
// Description: EV Vehicle profile management integrated with Spring Boot REST API.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore } from './dataStore';

export const vehicleService = {
  async getVehicles(userId) {
    try {
      return await apiRequest('/vehicles');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const vehicles = dataStore.getVehicles(userId);
        return mockFetch(vehicles);
      }
      throw err;
    }
  },

  async addVehicle(userId, vehicleData) {
    try {
      return await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          modelId: Number(vehicleData.modelId || 1),
          registrationNumber: vehicleData.registrationNumber,
          batteryPercentage: Number(vehicleData.batteryPercentage || vehicleData.initialBatteryPercentage || 80.0),
        }),
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const vehicle = dataStore.addVehicle(userId, vehicleData);
        return mockFetch(vehicle);
      }
      throw err;
    }
  },

  async deleteVehicle(userId, vehicleId) {
    try {
      return await apiRequest(`/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        dataStore.deleteVehicle(vehicleId);
        return mockFetch({ message: 'Vehicle deleted successfully' });
      }
      throw err;
    }
  },

  async getVehicleModels() {
    try {
      return await apiRequest('/vehicle-models');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        return mockFetch(dataStore.getVehicleModels ? dataStore.getVehicleModels() : []);
      }
      throw err;
    }
  },
};

export default vehicleService;
