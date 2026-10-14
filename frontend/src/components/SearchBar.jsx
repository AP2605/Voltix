// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: SearchBar.jsx
// Description: Accessible search bar input with clear button.
// ============================================================================

import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search stations by name, city, or address...' }) {
  return (
    <div className="search-input-box">
      <Search size={18} className="search-icon-pos" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search charging stations"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            padding: '4px',
          }}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
