// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: useAuth.js
// Description: Custom hook exporting authentication state and actions.
// ============================================================================

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
