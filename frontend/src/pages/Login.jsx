// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Login.jsx
// Description: User sign-in page delegating to unified Auth experience.
// ============================================================================

import React from 'react';
import Auth from './Auth';

export default function Login() {
  return <Auth defaultMode="login" />;
}
