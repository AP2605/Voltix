// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Reservation.jsx
// Description: Slot booking screen backed by persistent user records.
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { stationService } from '../services/stationService';
import { reservationService } from '../services/reservationService';
import { dataStore } from '../services/dataStore';
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
  const [reservationDate, setReservationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');

  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const userVehicles = dataStore.getVehicles(currentUser.userId);
        setVehicles(userVehicles);
        if (userVehicles.length > 0) {
          setSelectedVehicleId(userVehicles[0].vehicleId);
        }

        const res = await stationService.getStationById(stationId || 1);
        setStation(res.data);
        const avail = res.data.chargers?.find((c) => c.status === 'AVAILABLE');
        if (avail) {
          setSelectedChargerId(avail.chargerId);
        } else if (res.data.chargers?.length > 0) {
          setSelectedChargerId(res.data.chargers[0].chargerId);
        }
      } catch (err) {
        setError(err.message || 'Station not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stationId, currentUser]);

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

  const selectedVehicle = vehicles.find((v) => v.vehicleId === Number(selectedVehicleId));
  const selectedCharger = station?.chargers?.find((c) => c.chargerId === Number(selectedChargerId));

  // Dynamic Cost Calculation Summary
  const startHour = parseInt(startTime.split(':')[0] || '11', 10);
  const endHour = parseInt(endTime.split(':')[0] || '12', 10);
  const durationHours = Math.max(1, endHour - startHour);
  const powerKw = selectedCharger?.powerKw || 50;
  const estimatedEnergyKwh = Math.round(powerKw * durationHours * 0.7);
  const ratePerKwh = selectedCharger?.pricePerKwh || station?.basePricePerKwh || 14.0;
  const energyCost = estimatedEnergyKwh * ratePerKwh;
  const reservationFee = 50.0;
  const estimatedTotal = energyCost + reservationFee;

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

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        userId: currentUser.userId,
        vehicleId: selectedVehicleId,
        stationId: station.stationId,
        chargerId: selectedChargerId,
        startTime: `${reservationDate} ${startTime}:00`,
        endTime: `${reservationDate} ${endTime}:00`,
        estimatedCost: estimatedTotal,
      };

      const res = await reservationService.createReservation(payload);
      setConfirmedReservation(res.data);
    } catch (err) {
      setError(err.message || 'Slot reservation failed. The bay might be occupied.');
    } finally {
      setSubmitting(false);
    }
  };

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
                VX-RES-{confirmedReservation.reservationId.toString().slice(-6)}
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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Estimated Cost</span>
              <strong className="mono" style={{ fontSize: '16px' }}>₹{Number(confirmedReservation.estimatedCost).toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/history')}>
              View My Reservations
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
          <button className="btn btn-primary" onClick={() => navigate('/profile')}>
            <Plus size={16} />
            Register Vehicle in Profile
          </button>
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
                  Select Vehicle
                </h3>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    className="form-control"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                  >
                    {vehicles.map((v) => (
                      <option key={v.vehicleId} value={v.vehicleId}>
                        {v.manufacturer} {v.modelName} &bull; {v.registrationNumber} ({v.batteryCapacity} kWh)
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
                    const isSelected = selectedChargerId === ch.chargerId;

                    return (
                      <div
                        key={ch.chargerId}
                        onClick={() => isAvailable && setSelectedChargerId(ch.chargerId)}
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
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>
                            {ch.chargerNumber} &bull; {ch.connectorType}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Rated Power: {ch.powerKw} kW &bull; ₹{ch.pricePerKwh || station.basePricePerKwh}/kWh
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

              {/* Date and Time Slot Picker */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  Select Date & Time Interval
                </h3>

                <div className="form-group">
                  <label className="form-label">Reservation Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={reservationDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setReservationDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Booking Summary & Final Confirmation */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '96px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
                  Booking Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location</span>
                    <span style={{ fontWeight: 600 }}>{station.stationName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bay Selected</span>
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {selectedCharger ? `${selectedCharger.chargerNumber} (${selectedCharger.powerKw} kW)` : 'None'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery</span>
                    <span className="mono" style={{ fontWeight: 600 }}>~{estimatedEnergyKwh} kWh</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Energy Tariff</span>
                    <span className="mono">₹{ratePerKwh.toFixed(2)}/kWh</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Slot Lock Fee</span>
                    <span className="mono">₹{reservationFee.toFixed(2)}</span>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '2px dashed var(--border-card)',
                    paddingTop: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 700 }}>Estimated Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{estimatedTotal.toFixed(2)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Final bill settled after session completion
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={submitting || !selectedChargerId || !selectedVehicleId}
                >
                  {submitting ? 'Confirming Slot...' : 'Confirm & Hold Bay'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
