// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: ChargingSession.jsx
// Description: Live charging session telemetry monitor with simulated demo mode,
//              real-time energy delivery ticker, and server billing settlement.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Play,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chargingService } from '../services/chargingService';
import { vehicleService } from '../services/vehicleService';
import { stationService } from '../services/stationService';
import { reservationService } from '../services/reservationService';
import { dataStore } from '../services/dataStore';
import Loading, { EmptyState } from '../components/Loading';

export default function ChargingSession() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationIdParam = searchParams.get('reservationId');

  const [session, setSession] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);

  // Live timer tick state (updates every second)
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Quick start session state
  const [startStationId, setStartStationId] = useState('');
  const [startVehicleId, setStartVehicleId] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const loadSession = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch active session from backend
      const res = await chargingService.getActiveSession(currentUser.userId);
      setSession(res.data || null);

      // 2. If a reservationId is passed in URL query, load its details
      if (reservationIdParam) {
        try {
          const resvRes = await reservationService.getReservations(currentUser.userId);
          const found = (resvRes.data || []).find((r) => r.reservationId === Number(reservationIdParam));
          if (found) setReservation(found);
        } catch (resvErr) {
          console.warn('Could not load reservation query param:', resvErr);
        }
      }

      // 3. Load user's vehicles for selection
      try {
        const vRes = await vehicleService.getVehicles(currentUser.userId);
        const userVehicles = vRes.data || [];
        setVehicles(userVehicles);
        if (userVehicles.length > 0 && !startVehicleId) {
          setStartVehicleId(String(userVehicles[0].vehicleId));
        }
      } catch {
        const userVehicles = dataStore.getVehicles(currentUser.userId);
        setVehicles(userVehicles);
        if (userVehicles.length > 0 && !startVehicleId) {
          setStartVehicleId(String(userVehicles[0].vehicleId));
        }
      }

      // 4. Load stations
      try {
        const stRes = await stationService.getStations();
        const allStations = stRes.data || [];
        setStations(allStations);
        if (allStations.length > 0 && !startStationId) {
          setStartStationId(String(allStations[0].stationId));
        }
      } catch {
        const allStations = dataStore.getStations();
        setStations(allStations);
        if (allStations.length > 0 && !startStationId) {
          setStartStationId(String(allStations[0].stationId));
        }
      }
    } catch (err) {
      console.error('Failed to load charging session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [currentUser, reservationIdParam]);

  // Live timer tick for active session
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Periodic polling to detect backend auto-stop or session finalization
  useEffect(() => {
    if (!session) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await chargingService.getActiveSession(currentUser?.userId);
        if (!res.data || res.data.status === 'COMPLETED' || res.data.endTime) {
          navigate(`/payment/${session.sessionId}`);
        }
      } catch (err) {
        // ignore background poll errors
      }
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [session, currentUser, navigate]);

  const handleStartSessionFromReservation = async () => {
    if (!reservationIdParam) return;
    setStarting(true);
    setStartError('');
    try {
      await chargingService.startSession({
        reservationId: Number(reservationIdParam),
      });
      await loadSession();
    } catch (err) {
      setStartError(err.message || 'Failed to start session from reservation.');
    } finally {
      setStarting(false);
    }
  };

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
      const availCharger = st?.chargers?.find((c) => c.status === 'AVAILABLE') || st?.chargers?.[0];
      if (!availCharger) throw new Error('No charger available at this station.');

      await chargingService.startSession({
        userId: currentUser.userId,
        vehicleId: Number(startVehicleId),
        stationId: Number(startStationId),
        chargerId: Number(availCharger.chargerId),
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
        <Loading message="Connecting to bay telemetry stream..." />
      </div>
    );
  }

  // If no active session, show reservation prompt or Quick Start form
  if (!session) {
    return (
      <div className="page-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">Live Charging Telemetry</h1>
            <p className="header-subtitle">Real-time power monitoring and bay diagnostics</p>
          </div>
        </div>

        {/* If user navigated with a confirmed reservation */}
        {reservationIdParam && reservation && (() => {
          const isGraceExpired = reservation.status === 'CANCELLED' ||
            reservation.status === 'EXPIRED' ||
            (reservation.startTime && Date.now() > new Date(reservation.startTime).getTime() + 30 * 60 * 1000);

          if (isGraceExpired) {
            return (
              <div
                className="card"
                style={{
                  maxWidth: '680px',
                  margin: '0 auto 28px',
                  borderColor: '#fca5a5',
                  background: '#fef2f2',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', marginBottom: '10px' }}>
                  <AlertOctagon size={22} style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                    Reservation Expired & Cancelled
                  </h3>
                </div>
                <p style={{ fontSize: '13.5px', color: '#7f1d1d', marginBottom: '16px', lineHeight: 1.5 }}>
                  This reservation (#VX-RES-{String(reservation.reservationId).padStart(4, '0')}) was cancelled because charging was not initiated within the 30-minute grace period from the scheduled start time ({reservation.startTime?.slice(11, 16)}). The bay has been released back to the network.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/stations')}
                >
                  Find Available Chargers
                </button>
              </div>
            );
          }

          return (
            <div
              className="card"
              style={{
                maxWidth: '680px',
                margin: '0 auto 28px',
                border: '2px solid var(--primary)',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
                    Confirmed Reservation Ready to Plug In
                  </h3>
                  <span className="mono" style={{ fontSize: '12.5px', color: 'var(--primary)' }}>
                    Ref: VX-RES-#{String(reservation.reservationId).padStart(4, '0')}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-page)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Station Hub</span>
                  <strong>{reservation.stationName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Assigned Bay</span>
                  <strong className="mono">{reservation.chargerNumber} ({reservation.connectorType})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Vehicle</span>
                  <strong>{reservation.vehicleName || 'Registered EV'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Slot Time</span>
                  <strong className="mono">{reservation.startTime?.slice(11, 16)} - {reservation.endTime?.slice(11, 16)}</strong>
                </div>
              </div>

              {startError && (
                <div className="form-error" style={{ marginBottom: '16px' }}>
                  {startError}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={handleStartSessionFromReservation}
                disabled={starting}
                style={{ background: '#059669', borderColor: '#059669' }}
              >
                <Play size={18} />
                {starting ? 'Connecting Gun & Engaging Lock...' : '🔌 Plug In Cable & Start Charging'}
              </button>
            </div>
          );
        })()}

        {/* If no reservation param, offer Explore or Instant Start */}
        {!reservationIdParam && (
          <>
            <EmptyState
              title="No Active Charging Session"
              description="Your vehicle is not currently plugged into any network bay. You can connect at a station or launch an instant simulated session below."
              action={
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stations')}>
                  Explore Stations
                </button>
              }
            />

            {vehicles.length > 0 && stations.length > 0 && (
              <div className="card" style={{ maxWidth: '640px', margin: '32px auto 0' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                  Walk-In Instant Charging
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Simulate plugging your EV directly into an available charging bay.
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
                          {v.manufacturer} {v.modelName} &bull; {v.registrationNumber} ({v.batteryCapacity || '40'} kWh)
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
                          {s.stationName} ({s.cityName}) &bull; {s.availableChargersCount || 3} free bays
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
          </>
        )}
      </div>
    );
  }

  // ==========================================================================
  // ACTIVE CHARGING SESSION VIEW
  // ==========================================================================
  const startTimestamp = session.startTime ? new Date(session.startTime).getTime() : currentTime;
  const elapsedSeconds = Math.max(1, Math.floor((currentTime - startTimestamp) / 1000));
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedSecRemainder = elapsedSeconds % 60;
  const elapsedHours = elapsedSeconds / 3600;

  // Authoritative Full Booked Duration & Deadline Countdown
  const bookedDurationMinutes = session.bookedDurationMinutes || 60;
  const expectedEndMs = session.expectedEndTime
    ? new Date(session.expectedEndTime).getTime()
    : startTimestamp + (bookedDurationMinutes * 60 * 1000);

  const remainingSeconds = Math.max(0, Math.floor((expectedEndMs - currentTime) / 1000));
  const remMinutes = Math.floor(remainingSeconds / 60);
  const remSecRemainder = remainingSeconds % 60;

  const powerKw = session.powerKw || 50;
  // Realistic energy delivery calculation (kW * hours * efficiency factor)
  const energyConsumedKwh = +(powerKw * elapsedHours * 0.92).toFixed(2);
  const rate = Number(session.pricePerKwh || 14.0);
  const currentCost = +(energyConsumedKwh * rate).toFixed(2);

  const startSoc = session.startBatteryPercentage != null ? Number(session.startBatteryPercentage) : 40;
  const batteryCap = 50; // standard 50 kWh pack
  const addedSoc = (energyConsumedKwh / batteryCap) * 100;
  const currentSoc = Math.min(100, Math.round(startSoc + addedSoc));

  const voltage = 415; // standard 3-phase DC rectified voltage
  const amperage = +(powerKw * 1000 / voltage).toFixed(1);

  return (
    <div className="page-wrapper">
      {/* Session Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div className="session-live-badge">
            <span className="live-indicator-dot" />
            <span>SESSION #VX-S{String(session.sessionId).padStart(4, '0')} &bull; HIGH-POWER CHARGING</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
            {session.stationName} &bull; {session.chargerNumber}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Vehicle: <strong>{session.vehicleName}</strong> &bull; Connector: <strong>{session.connectorType}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleEmergencyStop}
            title="Emergency Power Shutdown"
          >
            <AlertOctagon size={16} />
            Emergency Stop
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStopCharging}
            disabled={stopping}
            style={{ background: '#059669', borderColor: '#059669' }}
          >
            <CheckCircle2 size={16} />
            {stopping ? 'Finalizing Bill...' : 'Stop & Finalize Billing'}
          </button>
        </div>
      </div>

      {/* Main Telemetry Visual Dashboard */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', color: '#ffffff', marginBottom: '24px', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Battery State of Charge
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
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Calculated Meter Energy</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Running Tariff Cost
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
              <span style={{ color: 'var(--text-muted)' }}>Session Start</span>
              <span className="mono">{new Date(startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Booked Duration</span>
              <strong className="mono">{bookedDurationMinutes} mins</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Scheduled Stop</span>
              <span className="mono">{new Date(expectedEndMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Time Remaining</span>
              <strong className="mono" style={{ color: remainingSeconds < 300 ? '#f59e0b' : 'var(--primary)', fontSize: '15px' }}>
                {remainingSeconds > 0 ? `${remMinutes}m ${remSecRemainder}s` : 'Finalizing...'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Elapsed Duration</span>
              <span className="mono">
                {elapsedMinutes}m {elapsedSecRemainder}s
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Session State</span>
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
              <span style={{ color: 'var(--text-muted)' }}>Voltage & Current</span>
              <strong className="mono">{voltage}V &bull; {amperage}A</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connector Standard</span>
              <strong>{session.connectorType}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Safety Relay</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Engaged &bull; Cable Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
