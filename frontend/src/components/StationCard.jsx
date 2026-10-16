// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StationCard.jsx
// Description: Reusable station card for discovery search and dashboard.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StationCard({ station, isSelected = false, onSelect = () => {} }) {
  const navigate = useNavigate();

  const totalChargers = station.chargers?.length || 0;
  const availableChargers = station.chargers?.filter((c) => c.status === 'AVAILABLE').length || 0;
  const maxPowerKw =
    station.chargers && station.chargers.length > 0
      ? Math.max(...station.chargers.map((c) => c.powerKw || 0))
      : 50;

  const hasCoords =
    station.latitude != null &&
    station.longitude != null &&
    !isNaN(parseFloat(station.latitude)) &&
    !isNaN(parseFloat(station.longitude));

  return (
    <div
      className={`station-card ${isSelected ? 'selected-card' : ''}`}
      onClick={() => onSelect(station)}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: isSelected ? '2px solid var(--primary)' : undefined,
        boxShadow: isSelected ? '0 0 0 3px rgba(16, 185, 129, 0.15), var(--shadow-md)' : undefined,
      }}
    >
      <div>
        <div className="station-card-header">
          <div>
            <h3 className="station-name-text" style={{ color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
              {station.stationName}
            </h3>
            <div className="station-city-badge">
              <MapPin size={13} />
              <span>
                {station.cityName || ''}{station.state ? `, ${station.state}` : ''}
                {station.distanceKm ? ` &bull; ${station.distanceKm} km away` : ''}
              </span>
            </div>
          </div>
          <StatusBadge status={station.status} size="sm" />
        </div>

        {!hasCoords && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: '#d97706',
              background: '#fef3c7',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '10px',
            }}
          >
            <AlertTriangle size={13} />
            <span>Map coordinates not available for this site</span>
          </div>
        )}

        <div className="station-meta-strip">
          <div className="meta-item">
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {availableChargers} of {totalChargers} Available
            </span>
          </div>
          <div className="meta-item">
            <Zap size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600 }}>Up to {maxPowerKw} kW</span>
          </div>
          <div className="meta-item">
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{station.operatingHours || '24/7 Open'}</span>
          </div>
        </div>

        {/* Charger connector chips */}
        <div className="charger-status-chips">
          {station.chargers?.map((ch) => (
            <span key={ch.chargerId} className="charger-chip">
              <span
                className="chip-dot"
                style={{
                  backgroundColor:
                    ch.status === 'AVAILABLE'
                      ? 'var(--status-available)'
                      : ch.status === 'OCCUPIED'
                      ? 'var(--status-occupied)'
                      : ch.status === 'RESERVED'
                      ? 'var(--status-reserved)'
                      : 'var(--status-maintenance)',
                }}
              />
              {ch.chargerNumber} &bull; {ch.connectorType} ({ch.powerKw}kW)
            </span>
          ))}
        </div>
      </div>

      <div className="station-footer" onClick={(e) => e.stopPropagation()}>
        <div className="station-price-box">
          <span className="price-unit-lbl">Base Tariff</span>
          <span className="price-main-val">
            ₹{Number(station.basePricePerKwh || 14).toFixed(2)}
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/kWh</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/stations/${station.stationId}`)}
          >
            View Details
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/reservation/${station.stationId}`)}
            disabled={availableChargers === 0}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
