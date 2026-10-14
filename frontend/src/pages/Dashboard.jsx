// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Dashboard.jsx
// Description: User dashboard derived strictly from persisted account state,
//              featuring real zero states and dynamic telemetry updates.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Calendar,
  Wallet,
  Clock,
  ArrowRight,
  Leaf,
  CheckCircle2,
  Inbox,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BatteryStatus from '../components/BatteryStatus';
import StationCard from '../components/StationCard';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { stationService } from '../services/stationService';
import { chargingService } from '../services/chargingService';
import { paymentService } from '../services/paymentService';
import { dataStore } from '../services/dataStore';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [nearbyStations, setNearbyStations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [metrics, setMetrics] = useState({
    walletBalance: 0.0,
    monthlyEnergyKwh: 0.0,
    co2OffsetKg: 0,
    completedChargesCount: 0,
  });
  const [vehicles, setVehicles] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser) return;
      try {
        const [stationsRes, sessionRes, metricsRes] = await Promise.all([
          stationService.getNearbyStations(3),
          chargingService.getActiveSession(currentUser.userId),
          paymentService.getUserMetrics(currentUser.userId),
        ]);

        setNearbyStations(stationsRes.data || []);
        setActiveSession(sessionRes.data || null);
        setMetrics(
          metricsRes.data || {
            walletBalance: 0.0,
            monthlyEnergyKwh: 0.0,
            co2OffsetKg: 0,
            completedChargesCount: 0,
          }
        );

        // Fetch user's registered vehicles
        const userVehicles = dataStore.getVehicles(currentUser.userId);
        setVehicles(userVehicles);

        // Fetch user's actual sessions & wallet transactions for recent activity
        const userWallet = dataStore.getWallet(currentUser.userId);
        const userSessions = dataStore.getSessions(currentUser.userId);
        const userReservations = dataStore.getReservations(currentUser.userId);

        const activities = [];

        userSessions.forEach((s) => {
          activities.push({
            id: `sess-${s.sessionId}`,
            timestamp: s.endTime || s.startTime,
            title: `Charging Session #${s.sessionId.toString().slice(-4)} (${s.status})`,
            subtitle: `${s.stationName} &bull; ${s.chargerNumber}`,
            amount: s.finalCost ? `₹${s.finalCost.toFixed(2)}` : null,
            type: 'SESSION',
            dateRaw: s.endTime || s.startTime,
          });
        });

        userWallet.transactions.forEach((tx) => {
          activities.push({
            id: `tx-${tx.transactionId}`,
            timestamp: tx.date,
            title: tx.description,
            subtitle: `Balance: ₹${tx.balanceAfter.toFixed(2)}`,
            amount: tx.type === 'CREDIT' ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`,
            type: tx.type,
            dateRaw: tx.date,
          });
        });

        userReservations.forEach((r) => {
          activities.push({
            id: `res-${r.reservationId}`,
            timestamp: r.startTime,
            title: `Reservation VX-${r.reservationId.toString().slice(-4)} (${r.status})`,
            subtitle: `${r.stationName} &bull; Bay ${r.chargerNumber}`,
            amount: null,
            type: 'RESERVATION',
            dateRaw: r.startTime,
          });
        });

        activities.sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw));
        setRecentActivity(activities.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading account data..." />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

  return (
    <div className="page-wrapper">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">
            {greeting}, {currentUser?.name?.split(' ')[0] || 'Driver'}
          </h1>
          <p className="header-subtitle">
            Manage your charging, track real energy usage, and reserve available network bays
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/stations')}>
          <MapPin size={16} />
          Find Stations
        </button>
      </div>

      {/* Active Charging Session Banner (Real State Only) */}
      {activeSession ? (
        <div className="active-session-banner">
          <div>
            <div className="session-live-badge">
              <span className="live-indicator-dot" />
              <span>LIVE CHARGING SESSION</span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '4px' }}>
              {activeSession.stationName} &bull; {activeSession.chargerNumber}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#94a3b8' }}>
              {activeSession.vehicleName} ({activeSession.registrationNumber}) &bull; {activeSession.connectorType}
            </p>
          </div>

          <div className="session-stats-strip">
            <div className="session-stat-item">
              <span className="session-stat-lbl">Elapsed Time</span>
              <span className="session-stat-val">
                {Math.max(1, Math.round((Date.now() - activeSession.startTime) / 60000))} min
              </span>
            </div>
            <div className="session-stat-item">
              <span className="session-stat-lbl">Energy Delivered</span>
              <span className="session-stat-val">
                {+(
                  (activeSession.powerKw || 50) *
                  (Math.max(1, Math.round((Date.now() - activeSession.startTime) / 60000)) / 60)
                ).toFixed(2)}{' '}
                <span style={{ fontSize: '13px', fontWeight: 500 }}>kWh</span>
              </span>
            </div>
            <div className="session-stat-item">
              <span className="session-stat-lbl">Bay Rate</span>
              <span className="session-stat-val">₹{activeSession.pricePerKwh}/kWh</span>
            </div>
          </div>

          <div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/charging')}
              style={{ background: '#ffffff', color: 'var(--text-main)' }}
            >
              View Live Session
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-page)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>No Active Charging Session</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Plug into an available bay or reserve a slot to begin charging.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stations')}>
            Find a Station
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Top Grid: Battery Telemetry Card + 4 Real KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <BatteryStatus
          vehicle={primaryVehicle}
          onAddVehicle={() => navigate('/profile')}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <StatCard
            title="Wallet Balance"
            value={`₹${metrics.walletBalance.toFixed(2)}`}
            icon={Wallet}
            subtext={metrics.walletBalance === 0 ? 'Add funds to start charging' : 'Available prepaid balance'}
          />
          <StatCard
            title="Monthly Energy"
            value={`${metrics.monthlyEnergyKwh} kWh`}
            icon={Zap}
            subtext="Actual energy consumed"
          />
          <StatCard
            title="CO2 Offset"
            value={`${metrics.co2OffsetKg} kg`}
            icon={Leaf}
            subtext="Calculated from actual energy"
          />
          <StatCard
            title="Completed Charges"
            value={`${metrics.completedChargesCount} ${metrics.completedChargesCount === 1 ? 'Session' : 'Sessions'}`}
            icon={CheckCircle2}
            subtext="Completed sessions count"
          />
        </div>
      </div>

      {/* Nearby Charging Stations */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Nearby Charging Stations</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Operational stations and real-time bay availability
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/stations')}
          >
            View All Stations ({nearbyStations.length})
            <ArrowRight size={14} />
          </button>
        </div>

        {nearbyStations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              No charging stations available nearby.
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {nearbyStations.map((station) => (
              <StationCard key={station.stationId} station={station} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Feed (Derived from Persisted State) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Recent Activity</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Your latest charging sessions and wallet transactions
            </p>
          </div>
          {recentActivity.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/history')}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              View Full History
            </button>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <Inbox size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              No charging sessions or transactions yet
            </p>
            <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto 16px' }}>
              When you charge your vehicle or top up your wallet, your real-time records will appear here.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/wallet')}>
                <Plus size={14} />
                Add Funds
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stations')}>
                Explore Stations
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentActivity.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        act.type === 'CREDIT'
                          ? 'var(--status-available-bg)'
                          : act.type === 'SESSION'
                          ? 'var(--primary-light)'
                          : '#dbeafe',
                      color:
                        act.type === 'CREDIT'
                          ? 'var(--status-available)'
                          : act.type === 'SESSION'
                          ? 'var(--primary)'
                          : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {act.type === 'CREDIT' && <CreditCard size={18} />}
                    {act.type === 'DEBIT' && <CreditCard size={18} />}
                    {act.type === 'SESSION' && <Zap size={18} />}
                    {act.type === 'RESERVATION' && <Calendar size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{act.title}</div>
                    <div
                      style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                      dangerouslySetInnerHTML={{ __html: `${act.subtitle} &bull; ${act.timestamp}` }}
                    />
                  </div>
                </div>
                {act.amount && (
                  <div
                    className="mono"
                    style={{
                      fontWeight: 700,
                      fontSize: '14px',
                      color: act.amount.startsWith('+') ? '#059669' : 'var(--text-main)',
                    }}
                  >
                    {act.amount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
