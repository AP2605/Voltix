

// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: FilterPanel.jsx
// Description: Multi-attribute filter sidebar for station discovery.
// ============================================================================

import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterPanel({ filters, onChange, onReset, cities = [] }) {
  const handlePillClick = (key, value) => {
    onChange({
      ...filters,
      [key]: filters[key] === value ? '' : value,
    });
  };

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          style={{ fontSize: '11px', padding: '4px 8px' }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* City Filter */}
      <div className="filter-group">
        <label className="filter-label">Metropolitan City</label>
        <select
          className="form-control"
          value={filters.cityId || ''}
          onChange={(e) => onChange({ ...filters, cityId: e.target.value })}
          style={{ padding: '8px 12px', fontSize: '13px' }}
        >
          <option value="">All Cities (Network Wide)</option>
          {cities.map((c) => (
            <option key={c.cityId} value={c.cityId}>
              {c.cityName}, {c.state}
            </option>
          ))}
        </select>
      </div>

      {/* Connector Standard */}
      <div className="filter-group">
        <label className="filter-label">Connector Standard</label>
        <div className="filter-pills">
          {['CCS2', 'CHAdeMO', 'TYPE2', 'GB/T'].map((conn) => (
            <button
              key={conn}
              type="button"
              className={`filter-pill ${filters.connectorType === conn ? 'active' : ''}`}
              onClick={() => handlePillClick('connectorType', conn)}
            >
              {conn}
            </button>
          ))}
        </div>
      </div>

      {/* Charging Speed Tier */}
      <div className="filter-group">
        <label className="filter-label">Charging Speed Tier</label>
        <div className="filter-pills">
          {['Ultra Fast', 'DC Fast', 'AC Rapid'].map((speed) => (
            <button
              key={speed}
              type="button"
              className={`filter-pill ${filters.speedCategory === speed ? 'active' : ''}`}
              onClick={() => handlePillClick('speedCategory', speed)}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="filter-group">
        <label className="filter-label">Bay Availability</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={Boolean(filters.availableOnly)}
            onChange={(e) => onChange({ ...filters, availableOnly: e.target.checked })}
            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
          />
          <span>Show available bays only</span>
        </label>
      </div>

      {/* Minimum Rating */}
      <div className="filter-group">
        <label className="filter-label">Minimum Star Rating</label>
        <div className="filter-pills">
          {[4.5, 4.0, 3.5].map((stars) => (
            <button
              key={stars}
              type="button"
              className={`filter-pill ${filters.minRating === String(stars) ? 'active' : ''}`}
              onClick={() => handlePillClick('minRating', String(stars))}
            >
              ★ {stars}+
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
