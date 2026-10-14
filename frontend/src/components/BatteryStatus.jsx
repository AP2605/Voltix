// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: BatteryStatus.jsx
// Description: Real-time vehicle battery telemetry card with genuine empty state.
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BatteryCharging, Zap, Plus, Car } from 'lucide-react';

export default function BatteryStatus({ vehicle, onAddVehicle }) {
  const navigate = useNavigate();

  if (!vehicle) {
    return (
      <div className="battery-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '220px' }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Car size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            No Vehicle Connected
          </h3>
          <p style={{ fontSize: '13.5px', color: '#94a3b8', maxWidth: '360px', margin: '0 auto 18px' }}>
            Connect your electric vehicle to view battery State-of-Charge, estimated driving range, and compatible charger bays.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => (onAddVehicle ? onAddVehicle() : navigate('/profile'))}
          >
            <Plus size={14} />
            Connect Vehicle
          </button>
        </div>
      </div>
    );
  }

  const soc = Math.min(100, Math.max(0, Number(vehicle.batteryPercentage || 0)));
  const rangeKm = vehicle.estimatedRangeKm || Math.round((soc / 100) * (vehicle.batteryCapacity * 7.5));

  return (
    <div className="battery-card">
      <div className="battery-header">
        <div>
          <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Connected Vehicle
          </span>
          <h3 style={{ fontSize: '19px', fontWeight: 700, marginTop: '2px' }}>
            {vehicle.manufacturer} {vehicle.modelName}
          </h3>
          <span className="mono" style={{ fontSize: '13px', color: 'var(--primary)' }}>
            {vehicle.registrationNumber}
          </span>
        </div>
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <BatteryCharging size={24} />
        </div>
      </div>

      <div className="battery-visual-container">
        <div className="battery-gauge">
          <span className="battery-percentage-text">{soc.toFixed(0)}%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>
            State of Charge
          </span>
        </div>

        <div className="battery-range-box">
          <div className="range-val">{rangeKm} km</div>
          <div className="range-label">Estimated Range</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
            <Zap size={14} style={{ color: 'var(--primary)' }} />
            <span>Max Input: {vehicle.maxPower || 50} kW DC</span>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
          <span>Battery Pack: {vehicle.batteryCapacity || 40} kWh</span>
          <span>Target: 100%</span>
        </div>
        <div className="battery-bar-track">
          <div className="battery-bar-fill" style={{ width: `${soc}%` }} />
        </div>
      </div>
    </div>
  );
}
