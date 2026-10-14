// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: ChargerCard.jsx
// Description: Charger point unit card showing hardware connector and status.
// ============================================================================

import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ChargerCard({ charger, onSelect, selected = false, selectable = true }) {
  const isAvailable = charger.status === 'AVAILABLE';

  return (
    <div
      className={`charger-card ${selected ? 'selected' : ''}`}
      onClick={() => selectable && isAvailable && onSelect && onSelect(charger)}
      style={{
        cursor: selectable && isAvailable ? 'pointer' : 'default',
        opacity: isAvailable ? 1 : 0.75,
      }}
    >
      <div className="charger-card-left">
        <div
          className="charger-icon-wrapper"
          style={{
            background: selected ? 'var(--primary-light)' : undefined,
            color: selected ? 'var(--primary)' : undefined,
          }}
        >
          {selected ? <CheckCircle2 size={22} style={{ color: 'var(--primary)' }} /> : <Zap size={22} />}
        </div>
        <div>
          <div className="charger-name">{charger.chargerNumber}</div>
          <div className="charger-spec">
            {charger.connectorType} &bull; <strong style={{ color: 'var(--text-main)' }}>{charger.powerKw} kW</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: '15px', fontWeight: 700 }}>
            ₹{(charger.pricePerKwh || 14).toFixed(2)}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/kWh</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dynamic Rate</div>
        </div>

        <StatusBadge status={charger.status} size="sm" />
      </div>
    </div>
  );
}
