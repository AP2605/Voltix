// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: ReservationCard.jsx
// Description: Card representing planned charging bookings (RESERVATION entity).
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Zap, Car } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ReservationCard({ reservation, onCancel }) {
  const navigate = useNavigate();

  const isConfirmed = reservation.status === 'CONFIRMED';
  const isActive = reservation.status === 'ACTIVE';

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <span className="mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
            VX-RES-{reservation.reservationId}
          </span>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
            {reservation.stationName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Zap size={13} style={{ color: 'var(--primary)' }} />
            <span>Charger {reservation.chargerNumber} &bull; {reservation.connectorType}</span>
          </div>
        </div>
        <StatusBadge status={reservation.status} size="sm" />
      </div>

      <div
        style={{
          background: 'var(--bg-page)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          fontSize: '13px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Clock size={15} style={{ color: 'var(--text-muted)' }} />
          <span>
            {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &ndash;{' '}
            {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
          <span>{new Date(reservation.startTime).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', gridColumn: 'span 2' }}>
          <Car size={15} style={{ color: 'var(--text-muted)' }} />
          <span>{reservation.vehicleName}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Est. Cost: <strong className="mono" style={{ color: 'var(--text-main)', fontSize: '14px' }}>₹{(reservation.estimatedCost || 250).toFixed(2)}</strong>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isConfirmed && onCancel && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onCancel(reservation.reservationId)}
            >
              Cancel Booking
            </button>
          )}

          {(isConfirmed || isActive) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/charging')}
            >
              {isActive ? 'View Live Session' : 'Start Charging'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
