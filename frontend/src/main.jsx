// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: main.jsx
// Description: Application bootstrap mounting the React 18 root.
// ============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
