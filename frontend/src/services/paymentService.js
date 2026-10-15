// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: paymentService.js
// Description: Payment, digital wallet, and KPI service integrated with Spring Boot REST API.
// ============================================================================

import { apiRequest, mockFetch } from './api';
import { dataStore } from './dataStore';

export const paymentService = {
  async getWallet(userId) {
    try {
      return await apiRequest('/wallet');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const wallet = dataStore.getWallet(userId);
        return mockFetch(wallet);
      }
      throw err;
    }
  },

  async addMoney(userId, amount, method = 'UPI') {
    try {
      return await apiRequest('/wallet/top-up', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), paymentMethod: method }),
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const wallet = dataStore.addWalletFunds(userId, amount, method);
        return mockFetch(wallet);
      }
      throw err;
    }
  },

  async processPayment(payload) {
    try {
      return await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: payload.sessionId,
          paymentMethod: payload.paymentMethod || 'WALLET',
          amount: payload.amount,
        }),
      });
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const receipt = dataStore.processPayment(payload);
        return mockFetch(receipt);
      }
      throw err;
    }
  },

  async getUserMetrics(userId) {
    try {
      return await apiRequest('/dashboard/driver');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const metrics = dataStore.getUserMetrics(userId);
        return mockFetch(metrics);
      }
      throw err;
    }
  },

  async getNetworkMetrics() {
    try {
      return await apiRequest('/dashboard/admin');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        const metrics = dataStore.getNetworkMetrics();
        return mockFetch(metrics);
      }
      throw err;
    }
  },
};

export default paymentService;
