// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: api.js
// Description: Centralized HTTP client wrapper. Currently serves database-aligned
//              mock data with simulated network latency. Pre-configured for seamless
//              Spring Boot REST API integration (http://localhost:8080/api).
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const SIMULATED_DELAY_MS = 150;

/**
 * Simulates an asynchronous REST API call
 */
export async function mockFetch(data, shouldFail = false, errorMessage = 'API Error') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(errorMessage));
      } else {
        resolve({ data, status: 200, success: true });
      }
    }, SIMULATED_DELAY_MS);
  });
}

export default {
  BASE_URL,
  mockFetch,
};
