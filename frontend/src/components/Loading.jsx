// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Loading.jsx
// Description: Loading spinner and empty state components.
// ============================================================================

import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export default function Loading({ message = 'Loading EV Network data...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p style={{ fontSize: '14px', fontWeight: 500 }}>{message}</p>
    </div>
  );
}

export function EmptyState({ title = 'No items found', description = 'There is no data matching your criteria.', action = null }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <Inbox size={28} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 20px' }}>
        {description}
      </p>
      {action}
    </div>
  );
}

export function ErrorState({ error = 'Failed to load data', retry = null }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 24px', borderColor: '#fecaca' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
        System Error
      </h3>
      <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '16px' }}>
        {error}
      </p>
      {retry && (
        <button className="btn btn-secondary btn-sm" onClick={retry}>
          Retry Connection
        </button>
      )}
    </div>
  );
}
