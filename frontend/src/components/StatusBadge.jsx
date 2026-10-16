// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StatusBadge.jsx
// Description: Reusable indicator badge for charger, reservation, and payment states.
// ============================================================================

import React from 'react';

export default function StatusBadge({ status = 'AVAILABLE', size = 'md' }) {
  const normStatus = (status || '').toUpperCase();

  const getStyleClass = () => {
    switch (normStatus) {
      case 'AVAILABLE':
      case 'ACTIVE':
      case 'SUCCESS':
      case 'PAID':
      case 'COMPLETED':
        return 'badge-available';
      case 'OCCUPIED':
      case 'CHARGING':
      case 'IN_PROGRESS':
        return 'badge-occupied';
      case 'RESERVED':
      case 'PENDING':
      case 'CONFIRMED':
        return 'badge-reserved';
      case 'MAINTENANCE':
      case 'FAILED':
      case 'UNPAID':
        return 'badge-maintenance';
      case 'OFFLINE':
      case 'CANCELLED':
      case 'EXPIRED':
      case 'REFUNDED':
        return 'badge-offline';
      default:
        return 'badge-offline';
    }
  };

  return (
    <span className={`badge ${getStyleClass()} ${size === 'sm' ? 'text-xs' : ''}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {normStatus}
    </span>
  );
}
