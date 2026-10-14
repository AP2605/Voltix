// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StationCard.jsx
// Description: Reusable station card for discovery search and dashboard.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, Clock, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StationCard({ station }) {
  const navigate = useNavigate();

  const totalChargers = station.chargers?.length || 0;
  const availableChargers = station.chargers?.filter((c) => c.status === 'AVAILABLE').length || 0;
  const maxPowerKw =
    station.chargers && station.chargers.length > 0
      ? Math.max(...station.chargers.map((c) => c.powerKw || 0))
      : 50;

  return (
    <div className="station-card">
      <div>
        <div className="station-card-header">
          <div>
            <h3 className="station-name-text">{station.stationName}</h3>
            <div className="station-city-badge">
              <MapPin size={13} />
              <span>
                {station.cityName}, {station.state}
                {station.distanceKm ? ` &bull; ${station.distanceKm} km away` : ''}
              </span>
            </div>
          </div>
          <StatusBadge status={station.status} size="sm" />
        </div>

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

      <div className="station-footer">
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
