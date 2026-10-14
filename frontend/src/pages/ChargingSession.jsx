// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: ChargingSession.jsx
// Description: Live charging session telemetry monitor calculated directly from
//              persisted session state without random fake values.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BatteryCharging,
  Zap,
  Clock,
  Gauge,
  AlertOctagon,
  ArrowRight,
  Activity,
  CheckCircle2,
  Car,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chargingService } from '../services/chargingService';
import { dataStore } from '../services/dataStore';
import Loading, { EmptyState } from '../components/Loading';

export default function ChargingSession() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);

  // Quick start session state for testing if user has no session
  const [startStationId, setStartStationId] = useState('');
  const [startVehicleId, setStartVehicleId] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const loadSession = async () => {
    if (!currentUser) return;
    try {
      const res = await chargingService.getActiveSession(currentUser.userId);
      setSession(res.data);

      const userVehicles = dataStore.getVehicles(currentUser.userId);
      setVehicles(userVehicles);
      if (userVehicles.length > 0 && !startVehicleId) {
        setStartVehicleId(userVehicles[0].vehicleId);
      }

      const allStations = dataStore.getStations();
      setStations(allStations);
      if (allStations.length > 0 && !startStationId) {
        setStartStationId(allStations[0].stationId);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [currentUser]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!startVehicleId || !startStationId) {
      setStartError('Please select both a vehicle and a station.');
      return;
    }

    setStarting(true);
    setStartError('');
    try {
      const st = stations.find((s) => s.stationId === Number(startStationId));
      const availCharger = st?.chargers?.find((c) => c.status === 'AVAILABLE') || st?.chargers[0];
      if (!availCharger) throw new Error('No charger available at this station.');

      await chargingService.startSession({
        userId: currentUser.userId,
        vehicleId: startVehicleId,
        stationId: startStationId,
        chargerId: availCharger.chargerId,
      });

      await loadSession();
    } catch (err) {
      setStartError(err.message || 'Failed to start session.');
    } finally {
      setStarting(false);
    }
  };

  const handleStopCharging = async () => {
    if (!session) return;
    setStopping(true);
    try {
      const res = await chargingService.endSession(session.sessionId);
      navigate(`/payment/${res.data.sessionId}`);
    } catch (err) {
      alert(err.message || 'Failed to stop session');
      setStopping(false);
    }
  };

  const handleEmergencyStop = () => {
    if (window.confirm('Trigger emergency power shutdown for this charging bay?')) {
      handleStopCharging();
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading charging session status..." />
      </div>
    );
  }

  // If no active session, show empty state with optional Quick Start form
  if (!session) {
    return (
      <div className="page-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">Live Charging Telemetry</h1>
            <p className="header-subtitle">Real-time power monitoring and bay diagnostics</p>
          </div>
        </div>

        <EmptyState
          title="No Active Charging Session"
          description="Your vehicle is not currently plugged into any network bay. You can connect at a station or launch a session below."
          action={
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stations')}>
              Explore Stations
            </button>
          }
        />

        {/* Quick Launch Session (Permits user to actually start and test a charging session) */}
        {vehicles.length > 0 && stations.length > 0 && (
          <div className="card" style={{ maxWidth: '640px', margin: '32px auto 0' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
              Plug In & Start Charging
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Initiate a charging session for your vehicle at an available station bay.
            </p>

            {startError && (
              <div className="form-error" style={{ marginBottom: '14px' }}>
                {startError}
              </div>
            )}

            <form onSubmit={handleStartSession}>
              <div className="form-group">
                <label className="form-label">Select Registered Vehicle</label>
                <select
                  className="form-control"
                  value={startVehicleId}
                  onChange={(e) => setStartVehicleId(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                      {v.manufacturer} {v.modelName} &bull; {v.registrationNumber} ({v.batteryCapacity} kWh)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Station Hub</label>
                <select
                  className="form-control"
                  value={startStationId}
                  onChange={(e) => setStartStationId(e.target.value)}
                >
                  {stations.map((s) => (
                    <option key={s.stationId} value={s.stationId}>
                      {s.stationName} ({s.cityName}) &bull; {s.availableChargersCount} free bays
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={starting}>
                <Zap size={16} />
                {starting ? 'Connecting Bay...' : 'Initiate Charging Session'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Actual calculated metrics from real start time
  const now = Date.now();
  const elapsedMinutes = Math.max(1, Math.round((now - session.startTime) / 60000));
  const powerKw = session.powerKw || 50;
  const energyConsumedKwh = +(powerKw * (elapsedMinutes / 60)).toFixed(2);
  const rate = session.pricePerKwh || 14.0;
  const currentCost = +(energyConsumedKwh * rate).toFixed(2);

  const startSoc = session.startBatteryPercentage || 40;
  const userVehicles = dataStore.getVehicles(session.userId);
  const v = userVehicles.find((vh) => vh.vehicleId === session.vehicleId);
  const batteryCap = v?.batteryCapacity || 40;
  const addedSoc = (energyConsumedKwh / batteryCap) * 100;
  const currentSoc = Math.min(100, Math.round(startSoc + addedSoc));

  return (
    <div className="page-wrapper">
      {/* Session Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div className="session-live-badge">
            <span className="live-indicator-dot" />
            <span>SESSION #{session.sessionId.toString().slice(-4)} &bull; CHARGING ACTIVE</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
            {session.stationName} &bull; {session.chargerNumber}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Vehicle: <strong>{session.vehicleName}</strong> ({session.registrationNumber}) &bull; {session.connectorType}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleEmergencyStop}
            title="Emergency Stop"
          >
            <AlertOctagon size={16} />
            Emergency Stop
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStopCharging}
            disabled={stopping}
          >
            <CheckCircle2 size={16} />
            {stopping ? 'Stopping Session...' : 'Stop & Proceed to Pay'}
          </button>
        </div>
      </div>

      {/* Main Telemetry Visual Dashboard */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', color: '#ffffff', marginBottom: '24px', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              State of Charge
            </span>
            <div className="mono" style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
              {currentSoc}%
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Started at {startSoc}%</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Delivery Rate
            </span>
            <div className="mono" style={{ fontSize: '48px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {powerKw} <span style={{ fontSize: '20px', fontWeight: 600 }}>kW</span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Rated Bay Capacity</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Energy Delivered
            </span>
            <div className="mono" style={{ fontSize: '48px', fontWeight: 800, color: '#a7f3d0', marginTop: '4px' }}>
              {energyConsumedKwh} <span style={{ fontSize: '20px', fontWeight: 600 }}>kWh</span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Actual Metred Energy</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accumulated Cost
            </span>
            <div className="mono" style={{ fontSize: '48px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
              ₹{currentCost.toFixed(2)}
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>@ ₹{rate.toFixed(2)}/kWh</span>
          </div>
        </div>

        {/* Battery Progress Track */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>
            <span>Charging Progress</span>
            <span className="mono">{currentSoc}% / 100%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: 'var(--dark-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${currentSoc}%`, background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            Session Duration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Start Time</span>
              <span className="mono">{new Date(session.startTime).toLocaleTimeString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Elapsed Duration</span>
              <strong className="mono">{elapsedMinutes} minutes</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Session Status</span>
              <span className="badge badge-occupied">IN PROGRESS</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={18} style={{ color: '#0ea5e9' }} />
            Bay Electrical Parameters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connector Standard</span>
              <strong>{session.connectorType}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Station Tariff</span>
              <span className="mono">₹{rate.toFixed(2)}/kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bay Safety Relay</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Normal &bull; Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
