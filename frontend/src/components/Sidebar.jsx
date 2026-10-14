// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Sidebar.jsx
// Description: Secondary navigation sidebar for management portals.
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Zap, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ portalType = 'operator' }) {
  const { role } = useAuth();

  return (
    <aside
      style={{
        width: '240px',
        background: '#ffffff',
        borderRight: '1px solid var(--border-card)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {portalType === 'admin' ? 'Administration Console' : 'Operator Operations Hub'}
          </span>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {portalType === 'operator' ? (
            <>
              <li>
                <NavLink to="/operator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  <span>Overview</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/stations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <MapPin size={16} />
                  <span>My Stations</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Shield size={16} />
                  <span>Network Analytics</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/operator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Zap size={16} />
                  <span>Station Grid</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

      <div style={{ padding: '12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div><strong>VOLTIX Grid Engine</strong></div>
        <div>v1.0.0 &bull; Connected</div>
      </div>
    </aside>
  );
}
