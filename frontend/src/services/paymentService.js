// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: paymentService.js
// Description: Payment and digital wallet service managing persistent balance ledgers.
// ============================================================================

import { mockFetch } from './api';
import { dataStore } from './dataStore';

export const paymentService = {
  async getWallet(userId) {
    const wallet = dataStore.getWallet(userId);
    return mockFetch(wallet);
  },

  async addMoney(userId, amount, method = 'UPI') {
    const wallet = dataStore.addWalletFunds(userId, amount, method);
    return mockFetch(wallet);
  },

  async processPayment(payload) {
    const receipt = dataStore.processPayment(payload);
    return mockFetch(receipt);
  },

  async getUserMetrics(userId) {
    const metrics = dataStore.getUserMetrics(userId);
    return mockFetch(metrics);
  },

  async getNetworkMetrics() {
    const metrics = dataStore.getNetworkMetrics();
    return mockFetch(metrics);
  },
};

export default paymentService;
