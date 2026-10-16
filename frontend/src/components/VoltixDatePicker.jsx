// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: VoltixDatePicker.jsx
// Description: Custom Voltix-themed Date Picker with calendar popup, month
//              navigation, today highlight, and past-date disabling.
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function VoltixDatePicker({
  value, // format: 'YYYY-MM-DD'
  onChange,
  minDate = new Date().toISOString().split('T')[0],
  label = 'Reservation Date',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial date
  const parseDate = (str) => {
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const selectedDate = value ? parseDate(value) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  // Keep view aligned if value changes externally
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close calendar when clicking outside
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

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mm}-${dd}`;
    onChange(isoString);
    setIsOpen(false);
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatDisplay = (val) => {
    if (!val) return 'Select Date';
    const d = parseDate(val);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="voltix-date-picker-container" ref={containerRef} style={{ position: 'relative' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: value ? 'var(--text-main)' : 'var(--text-muted)' }}>
            {formatDisplay(value)}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
          {value === todayStr ? '(Today)' : ''}
        </span>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            width: '310px',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Calendar Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-card)',
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-card)',
                borderRadius: '6px',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <span
                key={d}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
            }}
          >
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(viewYear, viewMonth, day);
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isPast = minDate && dateStr < minDate;
              const isSelected = value === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '34px',
                    width: '34px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    border: isToday && !isSelected ? '1.5px solid var(--primary)' : 'none',
                    background: isSelected
                      ? 'var(--primary)'
                      : isToday
                      ? 'var(--primary-light)'
                      : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : isPast
                      ? '#cbd5e1'
                      : isToday
                      ? 'var(--primary-hover)'
                      : 'var(--text-main)',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontSize: '13px',
                    cursor: isPast ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title={dateStr}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Today Shortcut */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                onChange(todayStr);
                setIsOpen(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              Select Today
            </button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Voltix EV Scheduler
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
