// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Register.jsx
// Description: User registration page delegating to unified Auth experience.
// ============================================================================

import React from 'react';
import Auth from './Auth';

export default function Register() {
  return <Auth defaultMode="register" />;
}
