// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Landing.jsx
// Description: Full-width responsive product landing page with zero fake stats.
// ============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  Activity,
  ArrowRight,
  Gauge,
  Sparkles,
  Leaf,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleFindChargers = () => {
    if (isAuthenticated) {
      navigate('/stations');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Zap size={20} />
          </div>
          <span>VOLTIX</span>
        </div>

        <ul className="landing-links desktop-only">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#why-voltix">Why VOLTIX</a></li>
        </ul>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span className="desktop-only" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                {currentUser?.name}
              </span>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary btn-sm"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm desktop-only"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm desktop-only">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" style={{ top: '68px' }}>
            <ul className="mobile-nav-links">
              <li><a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">How It Works</a></li>
              <li><a href="#features" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Features</a></li>
              <li><a href="#why-voltix" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Why VOLTIX</a></li>
              {isAuthenticated ? (
                <>
                  <li style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                      Dashboard ({currentUser?.name})
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="mobile-nav-link"
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#dc2626' }}
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="landing-hero" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Smart Urban EV Charging Infrastructure</span>
        </div>

        <h1 className="hero-title">
          Find. Reserve. <span>Charge.</span>
        </h1>

        <p className="hero-subtitle">
          Smart EV charging infrastructure for a connected city. Real-time charger availability, guaranteed slot reservation, and instant contactless payments.
        </p>

        <div className="hero-actions" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={handleFindChargers}>
            <MapPin size={18} />
            Find Chargers
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Live Network Capabilities Banner (Real Technical Overview) */}
        <div className="hero-telemetry-preview" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-indicator-dot" />
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                VOLTIX Grid Engine
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
              Connected Municipal Infrastructure
            </span>
          </div>

          <div className="telemetry-grid">
            <div className="telemetry-item">
              <div className="telemetry-label">Network Protocol</div>
              <div className="telemetry-value" style={{ fontSize: '20px' }}>OCPP 2.0.1</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>Standardized Smart Grid</div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Supported Standards</div>
              <div className="telemetry-value" style={{ fontSize: '20px' }}>CCS2 &bull; Type 2</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>DC Fast & AC Rapid</div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Billing Model</div>
              <div className="telemetry-value" style={{ fontSize: '20px' }}>Time-of-Use</div>
              <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>Peak & Off-Peak Tariffs</div>
            </div>
            <div className="telemetry-item">
              <div className="telemetry-label">Slot Booking</div>
              <div className="telemetry-value" style={{ fontSize: '20px' }}>Guaranteed</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>Zero-Conflict Scheduling</div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header">
          <h2 className="section-title">How VOLTIX Works</h2>
          <p className="section-subtitle">A seamless journey from empty battery to fully charged</p>
        </div>

        <div className="features-grid">
          <div className="feature-card" style={{ textAlign: 'center' }}>
            <div className="feature-icon-box" style={{ margin: '0 auto 16px' }}>
              <MapPin size={24} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Step 1</div>
            <h3 className="feature-title">Discover</h3>
            <p className="feature-desc">Locate high-speed stations nearby filtered by connector standard (CCS2, Type 2) and live bay availability.</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center' }}>
            <div className="feature-icon-box" style={{ margin: '0 auto 16px' }}>
              <CalendarCheck size={24} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Step 2</div>
            <h3 className="feature-title">Reserve</h3>
            <p className="feature-desc">Lock your time slot in advance. Guaranteed reservation prevents queueing and eliminates conflicts.</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center' }}>
            <div className="feature-icon-box" style={{ margin: '0 auto 16px' }}>
              <Zap size={24} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Step 3</div>
            <h3 className="feature-title">Charge</h3>
            <p className="feature-desc">Plug in and monitor real-time charging metrics—duration, charging rate, and energy delivered.</p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center' }}>
            <div className="feature-icon-box" style={{ margin: '0 auto 16px' }}>
              <Wallet size={24} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Step 4</div>
            <h3 className="feature-title">Settle</h3>
            <p className="feature-desc">Automated deduction from your digital wallet with itemized billing and promotional discounts.</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="landing-section" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div className="section-header">
          <h2 className="section-title">Built for Smart Cities and Connected Drivers</h2>
          <p className="section-subtitle">Reliable urban charging management designed for performance and transparency</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box"><MapPin size={22} /></div>
            <h3 className="feature-title">Station Discovery</h3>
            <p className="feature-desc">Filter charging hubs by connector standard, distance, charging speed, and verified ratings.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><ShieldCheck size={22} /></div>
            <h3 className="feature-title">Conflict-Free Slots</h3>
            <p className="feature-desc">Guaranteed slot reservation ensures your charging bay is held exclusively for your vehicle.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><Activity size={22} /></div>
            <h3 className="feature-title">Session Telemetry</h3>
            <p className="feature-desc">Track active charging duration, power throughput, and cumulative energy consumed.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><Gauge size={22} /></div>
            <h3 className="feature-title">Time-of-Use Pricing</h3>
            <p className="feature-desc">Optimized tariffs that reward off-peak charging with discounted energy rates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><Wallet size={22} /></div>
            <h3 className="feature-title">Prepaid Digital Wallet</h3>
            <p className="feature-desc">Manage prepaid balances with transparent debit ledgers and instant top-ups.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box"><Leaf size={22} /></div>
            <h3 className="feature-title">Carbon Offset Tracking</h3>
            <p className="feature-desc">Calculate environmental impact with carbon emission offset metrics derived from real charging.</p>
          </div>
        </div>
      </section>

      {/* Why VOLTIX Section */}
      <section id="why-voltix" className="landing-section" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div className="section-header">
          <h2 className="section-title">Why Choose VOLTIX?</h2>
          <p className="section-subtitle">A dependable backbone for high-demand municipal EV charging operations</p>
        </div>

        <div className="grid-3">
          <div className="card">
            <Leaf size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Clean Environmental Impact</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every kilowatt-hour dispensed offsets an estimated 0.82 kg of carbon dioxide compared to internal combustion engines.
            </p>
          </div>

          <div className="card">
            <Clock size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Eliminate Queue Waiting</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Avoid arriving at occupied or non-functional stations. Real-time bay status and advance reservations ensure readiness.
            </p>
          </div>

          <div className="card">
            <ShieldCheck size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Transparent Accounting</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Double-entry digital wallet transactions and itemized invoices guarantee accountability and financial clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <div style={{ background: 'var(--primary-light)', borderTop: '1px solid var(--primary-border)', borderBottom: '1px solid var(--primary-border)', padding: '60px 24px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#065f46', marginBottom: '12px' }}>
          Experience Frictionless Urban EV Charging
        </h2>
        <p style={{ fontSize: '16px', color: '#047857', maxWidth: '600px', margin: '0 auto 24px' }}>
          Connect your vehicle and find high-speed charging hubs across the network.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            if (isAuthenticated) {
              navigate('/stations');
            } else {
              setShowAuthModal(true);
            }
          }}
        >
          {isAuthenticated ? 'Explore Stations' : 'Get Started'}
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer" style={{ width: '100%', boxSizing: 'border-box' }}>
        <p>VOLTIX &copy; 2026 — Urban EV Charging Network Management System.</p>
      </footer>

      {/* Sign In / Sign Up Prompt Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In or Sign Up Required"
      >
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <MapPin size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
            Sign In to Locate & Reserve Chargers
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            To view live charger status, inspect interactive station maps, and reserve charging bays across our urban network, please sign in or create an account.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ minWidth: '130px' }}
              onClick={() => {
                setShowAuthModal(false);
                navigate('/login');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ minWidth: '130px' }}
              onClick={() => {
                setShowAuthModal(false);
                navigate('/register');
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
