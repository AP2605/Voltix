// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: VoltixTimePicker.jsx
// Description: Custom Voltix-themed Time Slot Selector with 15-minute intervals,
//              AM/PM representation, and slot duration validation.
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

// Generates 15-minute slot options for 24 hours
const TIME_SLOTS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const time24 = `${hh}:${mm}`;

    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const displayTime = `${displayHour}:${mm} ${period}`;

    TIME_SLOTS.push({
      value: time24,
      label: displayTime,
      totalMinutes: h * 60 + m,
    });
  }
}

export default function VoltixTimePicker({
  value, // 'HH:mm'
  onChange,
  label = 'Select Time',
  minTime = null, // 'HH:mm' - slots before this are disabled
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedSlot = TIME_SLOTS.find((s) => s.value === value) || TIME_SLOTS[44]; // default 11:00 AM

  // Parse minTime to total minutes
  const minMinutes = minTime
    ? (() => {
        const [h, m] = minTime.split(':').map(Number);
        return h * 60 + m;
      })()
    : null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to selected slot when popover opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('.voltix-time-slot-selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelect = (slotValue) => {
    onChange(slotValue);
    setIsOpen(false);
  };

  return (
    <div className="voltix-time-picker-container" ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Trigger Button */}
      <div
        className="form-control"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: '#ffffff',
          userSelect: 'none',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border-card)',
          boxShadow: isOpen ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {selectedSlot?.label || value}
          </span>
        </div>
        <span className="mono" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {value}
        </span>
      </div>

      {/* Popover Slot Grid */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            width: '260px',
            maxHeight: '260px',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'var(--bg-page)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>15-Minute Slots</span>
            <span style={{ color: 'var(--primary)' }}>Voltix Standard</span>
          </div>

          <div
            ref={listRef}
            style={{
              overflowY: 'auto',
              maxHeight: '210px',
              padding: '6px',
            }}
          >
            {TIME_SLOTS.map((slot) => {
              const isDisabled = minMinutes !== null && slot.totalMinutes <= minMinutes;
              const isSelected = slot.value === value;

              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(slot.value)}
                  className={isSelected ? 'voltix-time-slot-selected' : ''}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isSelected
                      ? 'var(--primary)'
                      : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : isDisabled
                      ? '#cbd5e1'
                      : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s ease',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'var(--primary-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isDisabled) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{slot.label}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: '11px',
                      color: isSelected ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-muted)',
                    }}
                  >
                    {slot.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
