// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Navbar.jsx
// Description: Full-width responsive top navigation with mobile menu drawer
//              and real authenticated user profile display.
// ============================================================================

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  MapPin,
  BatteryCharging,
  History,
  Wallet,
  User,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <NavLink to="/dashboard" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Zap size={18} />
          </div>
          <span>VOLTIX</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <ul className="nav-links desktop-only">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/stations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MapPin size={16} />
              <span>Stations</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/charging" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BatteryCharging size={16} />
              <span>Charging</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <History size={16} />
              <span>History</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/wallet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Wallet size={16} />
              <span>Wallet</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={16} />
              <span>Profile</span>
            </NavLink>
          </li>

          {(role === 'OPERATOR' || role === 'ADMIN') && (
            <li>
              <NavLink to="/operator" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Zap size={16} style={{ color: '#2563eb' }} />
                <span>Operator</span>
              </NavLink>
            </li>
          )}

          {role === 'ADMIN' && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Shield size={16} style={{ color: '#d97706' }} />
                <span>Admin</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>

      <div className="nav-right">
        {currentUser && (
          <div className="user-profile-badge">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {getInitials(currentUser.name)}
            </div>
            <span className="user-meta-name desktop-only">{currentUser.name || 'User'}</span>
            <span className={`role-tag ${currentUser.role?.toLowerCase()}`}>
              {currentUser.role || 'USER'}
            </span>
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm desktop-only"
          onClick={handleLogout}
          title="Logout"
          style={{ padding: '7px 10px', color: '#dc2626' }}
        >
          <LogOut size={16} />
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <ul className="mobile-nav-links">
            <li>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/stations" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <MapPin size={18} />
                <span>Stations</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/charging" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <BatteryCharging size={18} />
                <span>Charging</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/history" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <History size={18} />
                <span>History</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/wallet" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Wallet size={18} />
                <span>Wallet</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <User size={18} />
                <span>Profile</span>
              </NavLink>
            </li>
            {(role === 'OPERATOR' || role === 'ADMIN') && (
              <li>
                <NavLink to="/operator" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                  <Zap size={18} />
                  <span>Operator Portal</span>
                </NavLink>
              </li>
            )}
            {role === 'ADMIN' && (
              <li>
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                  <Shield size={18} />
                  <span>Admin Hub</span>
                </NavLink>
              </li>
            )}
            <li style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="mobile-nav-link"
                style={{ width: '100%', color: '#dc2626' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
