// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Reservation.jsx
// Description: Slot booking screen backed by persistent user records,
//              custom Voltix Date/Time pickers, and dynamic duration tariffs.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Zap,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Plus,
  Play,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { stationService } from '../services/stationService';
import { reservationService } from '../services/reservationService';
import { vehicleService } from '../services/vehicleService';
import { dataStore } from '../services/dataStore';
import VoltixDatePicker from '../components/VoltixDatePicker';
import VoltixTimePicker from '../components/VoltixTimePicker';
import Loading, { ErrorState } from '../components/Loading';

export default function Reservation() {
  const { stationId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [error, setError] = useState('');

  // User Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedChargerId, setSelectedChargerId] = useState('');

  // Themed Date & Time State
  const todayStr = new Date().toISOString().split('T')[0];
  const [reservationDate, setReservationDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');

  const handleRegisterDefaultVehicle = async () => {
    if (!currentUser) return;
    try {
      setSubmitting(true);
      setError('');
      const newV = await vehicleService.addVehicle(currentUser.userId, {
        modelId: 1,
        registrationNumber: `TN-01-EV-${Math.floor(1000 + Math.random() * 9000)}`,
        batteryPercentage: 85.0,
      });
      const updatedList = [newV.data, ...vehicles];
      setVehicles(updatedList);
      setSelectedVehicleId(newV.data.vehicleId);
    } catch (err) {
      setError(err.message || 'Failed to register EV profile.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      setLoading(true);
      setError('');
      try {
        let userVehicles = [];
        try {
          const vRes = await vehicleService.getVehicles(currentUser.userId);
          userVehicles = vRes.data || [];
        } catch (vErr) {
          console.warn('Backend vehicles API failed, checking local store:', vErr);
          userVehicles = dataStore.getVehicles(currentUser.userId);
        }

        setVehicles(userVehicles);
        if (userVehicles.length > 0) {
          setSelectedVehicleId((prev) => {
            if (prev && userVehicles.some((v) => v.vehicleId === Number(prev))) {
              return prev;
            }
            return String(userVehicles[0].vehicleId);
          });
        }

        const res = await stationService.getStationById(stationId || 1);
        setStation(res.data);
        const avail = res.data.chargers?.find((c) => c.status === 'AVAILABLE');
        if (avail) {
          setSelectedChargerId(String(avail.chargerId));
        } else if (res.data.chargers?.length > 0) {
          setSelectedChargerId(String(res.data.chargers[0].chargerId));
        }
      } catch (err) {
        setError(err.message || 'Station not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stationId, currentUser]);

  // Dynamic Cost Calculation Summary with 15-min precision
  const [sH, sM] = (startTime || '11:00').split(':').map(Number);
  const [eH, eM] = (endTime || '12:00').split(':').map(Number);
  const startTotalMinutes = sH * 60 + sM;
  const endTotalMinutes = eH * 60 + eM;
  const rawDurationMinutes = endTotalMinutes - startTotalMinutes;
  const isInvalidInterval = rawDurationMinutes <= 0;
  const durationMinutes = isInvalidInterval ? 60 : rawDurationMinutes;
  const durationHours = durationMinutes / 60;

  const selectedVehicle = vehicles.find((v) => v.vehicleId === Number(selectedVehicleId));
  const selectedCharger = station?.chargers?.find((c) => c.chargerId === Number(selectedChargerId));

  const powerKw = selectedCharger?.powerKw || 50;
  const estimatedEnergyKwh = Number((powerKw * durationHours * 0.75).toFixed(1));
  const ratePerKwh = selectedCharger?.pricePerKwh || station?.basePricePerKwh || 14.0;
  const energyCost = estimatedEnergyKwh * ratePerKwh;
  const reservationFee = 50.0;
  const estimatedTotal = energyCost + reservationFee;

  // Format Duration for UI
  const formatDurationText = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
    return `${mins} mins`;
  };

  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);
    const [h, m] = newStart.split(':').map(Number);
    const startMins = h * 60 + m;
    const [endH, endM] = endTime.split(':').map(Number);
    const endMins = endH * 60 + endM;

    // Auto-advance endTime if startTime is equal or after endTime
    if (startMins >= endMins) {
      const advancedMins = Math.min(23 * 60 + 45, startMins + 60);
      const advH = String(Math.floor(advancedMins / 60)).padStart(2, '0');
      const advM = String(advancedMins % 60).padStart(2, '0');
      setEndTime(`${advH}:${advM}`);
    }
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError('Please add or select a vehicle before reserving.');
      return;
    }
    if (!selectedChargerId) {
      setError('Please select an available charging bay.');
      return;
    }
    if (isInvalidInterval) {
      setError('Reservation start time must be strictly before end time.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        userId: Number(currentUser.userId),
        vehicleId: Number(selectedVehicleId),
        stationId: Number(station.stationId),
        chargerId: Number(selectedChargerId),
        startTime: `${reservationDate}T${startTime}:00`,
        endTime: `${reservationDate}T${endTime}:00`,
        estimatedCost: Number(estimatedTotal),
      };

      const res = await reservationService.createReservation(payload);
      setConfirmedReservation(res.data);
    } catch (err) {
      setError(err.message || 'Slot reservation failed. The bay might be occupied or reserved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading station and bay booking schedule..." />
      </div>
    );
  }

  if (error && !station) {
    return (
      <div className="page-wrapper">
        <ErrorState error={error} retry={() => navigate('/stations')} />
      </div>
    );
  }

  // Confirmation Success View
  if (confirmedReservation) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            Reservation Confirmed
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>
            Your charging slot has been locked into the network schedule.
          </p>

          <div
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reservation Reference</span>
              <strong className="mono" style={{ color: 'var(--primary)' }}>
                VX-RES-{confirmedReservation.reservationId ? confirmedReservation.reservationId.toString().slice(-6) : 'CONFIRMED'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Station</span>
              <strong>{confirmedReservation.stationName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Assigned Bay</span>
              <strong className="mono">{confirmedReservation.chargerNumber} ({confirmedReservation.connectorType})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Vehicle</span>
              <span>{confirmedReservation.vehicleName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Time Slot</span>
              <span className="mono">{confirmedReservation.startTime} to {confirmedReservation.endTime}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-card)' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Estimated Tariff</span>
              <strong className="mono" style={{ fontSize: '16px' }}>₹{Number(confirmedReservation.estimatedCost || estimatedTotal || 0).toFixed(2)}</strong>
            </div>
            <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              💳 <strong>Reservation Security Deposit:</strong> A nominal slot lock fee of ₹50.00 is allocated from your wallet. Final energy charges settle idempotently upon session conclusion.
            </div>
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '12px', color: '#92400e' }}>
              ⏱️ <strong>30-Minute Arrival Grace Window:</strong> Please connect and start charging within 30 minutes of your scheduled start time. Uninitiated reservations are automatically cancelled and the bay released.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/charging?reservationId=${confirmedReservation.reservationId}`)}
              style={{ background: '#059669', borderColor: '#059669' }}
            >
              <Zap size={16} />
              🔌 Plug In & Start Charging Now
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/history')}>
              View in History
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Reserve a Charging Slot</h1>
          <p className="header-subtitle">
            Lock in a high-power charging bay at <strong>{station.stationName}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            borderColor: '#fecaca',
            background: '#fef2f2',
            marginBottom: '24px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ color: '#991b1b', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', maxWidth: '640px', margin: '0 auto' }}>
          <Car size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Vehicle Registered</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Please connect your electric vehicle to your account before making a slot reservation.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
              <Plus size={16} />
              Register Vehicle in Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmReservation}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Left: Booking Parameter Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Vehicle Selection */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={18} style={{ color: 'var(--primary)' }} />
                  Select Registered Vehicle
                </h3>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    className="form-control"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    required
                  >
                    {vehicles.map((v) => (
                      <option key={v.vehicleId} value={v.vehicleId}>
                        {v.manufacturer} {v.modelName} &bull; {v.registrationNumber} ({v.batteryCapacity || '40'} kWh)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Charger Bay Selection */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} style={{ color: 'var(--primary)' }} />
                  Select Charging Bay
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {station.chargers?.map((ch) => {
                    const isAvailable = ch.status === 'AVAILABLE';
                    const isSelected = selectedChargerId === String(ch.chargerId);

                    return (
                      <div
                        key={ch.chargerId}
                        onClick={() => isAvailable && setSelectedChargerId(String(ch.chargerId))}
                        style={{
                          padding: '14px 16px',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-card)'}`,
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--primary-light)' : '#ffffff',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.55,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>
                            {ch.chargerNumber} &bull; {ch.connectorType}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Rated Power: {ch.powerKw} kW &bull; ₹{Number(ch.pricePerKwh || station.basePricePerKwh || 14).toFixed(2)}/kWh
                          </div>
                        </div>
                        <span className={`badge badge-${ch.status.toLowerCase()}`}>
                          {ch.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redesigned Voltix Date and Time Selectors */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  Select Date & Time Interval
                </h3>

                <div className="form-group">
                  <VoltixDatePicker
                    value={reservationDate}
                    onChange={setReservationDate}
                    minDate={todayStr}
                    label="Reservation Date"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <VoltixTimePicker
                      value={startTime}
                      onChange={handleStartTimeChange}
                      label="Start Time"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <VoltixTimePicker
                      value={endTime}
                      onChange={setEndTime}
                      label="End Time"
                      minTime={startTime}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'var(--bg-page)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: 'var(--primary)' }} />
                    Slot Duration:
                  </span>
                  <strong style={{ color: 'var(--text-main)' }}>
                    {formatDurationText(durationMinutes)} ({Math.round(durationMinutes / 15)} slots of 15m)
                  </strong>
                </div>
              </div>
            </div>

            {/* Right: Authoritative Tariff Estimation & Confirm */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                  Booking Summary & Tariff
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Station</span>
                    <strong style={{ textAlign: 'right' }}>{station.stationName}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location</span>
                    <span style={{ textAlign: 'right' }}>{station.cityName}, {station.state}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Bay</span>
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {selectedCharger?.chargerNumber || 'Select Bay'} ({selectedCharger?.connectorType || '—'})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Selected EV</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedVehicle ? `${selectedVehicle.manufacturer} ${selectedVehicle.modelName}` : 'None'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Booking Interval</span>
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {startTime} – {endTime} ({formatDurationText(durationMinutes)})
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', margin: '4px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Rate per kWh</span>
                    <span className="mono">₹{Number(ratePerKwh).toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Est. Energy Delivered</span>
                    <span className="mono">{estimatedEnergyKwh} kWh</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Energy Subtotal</span>
                    <span className="mono">₹{energyCost.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Slot Reservation Hold</span>
                    <span className="mono">₹{reservationFee.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      borderTop: '2px solid var(--border-card)',
                      paddingTop: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>Estimated Total</span>
                    <strong className="mono" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                      ₹{estimatedTotal.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    margin: '16px 0 20px',
                    padding: '10px 12px',
                    background: 'var(--bg-page)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    fontSize: '11.5px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.45,
                  }}
                >
                  ℹ️ Slot will be reserved for 15 minutes past start time. Pre-authorization hold settles against final energy meter telemetry.
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={submitting || !selectedChargerId || !selectedVehicleId || isInvalidInterval}
                >
                  {submitting ? 'Locking Slot...' : 'Confirm Slot Reservation'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
