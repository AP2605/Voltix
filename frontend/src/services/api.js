// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: api.js
// Description: Centralized HTTP client communicating with Spring Boot REST API
//              (http://localhost:8080/api) with automatic JWT bearer auth injection
//              and seamless resilience fallback to local dataStore.
// ============================================================================

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8082/api');
const SIMULATED_DELAY_MS = 100;

export function getToken() {
  if (typeof localStorage === 'undefined') return null;
  const directToken = localStorage.getItem('voltix_token');
  if (directToken) return directToken;
  try {
    const raw = localStorage.getItem('voltix_auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (typeof body === 'object' && (body.message || body.error)) || `HTTP ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return { data: body, status: response.status, success: true };
}

/**
 * Fallback asynchronous simulation helper
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
  apiRequest,
  mockFetch,
  getToken,
};
