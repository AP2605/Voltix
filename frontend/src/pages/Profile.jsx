// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Profile.jsx
// Description: User profile reflecting driver identity and registered EV fleet.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  User,
  Car,
  Plus,
  Mail,
  Phone,
  Shield,
  Zap,
  BatteryCharging,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { VEHICLE_MODELS, dataStore } from '../services/dataStore';
import Modal from '../components/Modal';

export default function Profile() {
  const { currentUser } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('1');
  const [regNumber, setRegNumber] = useState('');
  const [initialSoc, setInitialSoc] = useState('65');
  const [error, setError] = useState('');

  const loadVehicles = () => {
    if (!currentUser) return;
    const userVehicles = dataStore.getVehicles(currentUser.userId);
    setVehicles(userVehicles);
  };

  useEffect(() => {
    loadVehicles();
  }, [currentUser]);

  const handleAddVehicle = (e) => {
    e.preventDefault();
    setError('');
    if (!regNumber.trim()) {
      setError('Registration number is required.');
      return;
    }

    try {
      dataStore.addVehicle(currentUser.userId, {
        modelId: selectedModelId,
        registrationNumber: regNumber,
        initialBatteryPercentage: initialSoc,
      });
      loadVehicles();
      setRegNumber('');
      setAddModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to register vehicle.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Driver Profile & Vehicles</h1>
          <p className="header-subtitle">
            Manage your account credentials and registered electric vehicles
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Personal Details Card */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
                margin: '0 auto 12px',
              }}
            >
              {getInitials(currentUser?.name)}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{currentUser?.name || 'Driver'}</h2>
            <span className={`role-tag ${currentUser?.role?.toLowerCase()}`} style={{ marginTop: '6px', display: 'inline-block' }}>
              {currentUser?.role || 'USER'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginTop: '2px' }}>
                <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                <span>{currentUser?.email || 'driver@voltix.in'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginTop: '2px' }}>
                <Phone size={15} style={{ color: 'var(--text-muted)' }} />
                <span>{currentUser?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>User ID</span>
              <div className="mono" style={{ fontWeight: 600, marginTop: '2px', color: 'var(--text-secondary)' }}>
                USR-{currentUser?.userId?.toString().slice(-6) || '1001'}
              </div>
            </div>
          </div>
        </div>

        {/* Registered Garage */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Connected Vehicles</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Electric vehicles registered for automatic compatibility matching and battery tracking
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
              <Plus size={14} />
              Add Vehicle
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No vehicles registered
              </h4>
              <p style={{ fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 20px' }}>
                Add your EV to track battery State-of-Charge, view estimated driving range, and reserve compatible bays.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
                <Plus size={14} />
                Register Vehicle Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {vehicles.map((v) => (
                <div
                  key={v.vehicleId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-page)',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: '#ffffff',
                        border: '1px solid var(--border-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <Car size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>
                        {v.manufacturer} {v.modelName}
                      </h4>
                      <span className="mono" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {v.registrationNumber} &bull; {v.batteryCapacity} kWh Battery
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Battery Level
                      </div>
                      <div className="mono" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>
                        {v.batteryPercentage}%
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Est. Range
                      </div>
                      <div className="mono" style={{ fontWeight: 700, fontSize: '15px' }}>
                        {v.estimatedRangeKm} km
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Max DC Input
                      </div>
                      <div className="mono" style={{ fontWeight: 700, fontSize: '15px' }}>
                        {v.maxPower} kW
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setError('');
        }}
        title="Register Electric Vehicle"
      >
        <form onSubmit={handleAddVehicle}>
          {error && (
            <div className="form-error" style={{ marginBottom: '14px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select EV Model</label>
            <select
              className="form-control"
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
            >
              {VEHICLE_MODELS.map((m) => (
                <option key={m.modelId} value={m.modelId}>
                  {m.manufacturer} {m.modelName} &bull; {m.batteryCapacity} kWh ({m.maxChargingPower} kW max)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Registration Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. TN-07-BW-2024"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              style={{ textTransform: 'uppercase' }}
              required
            />
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Registration number must be unique across the network.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Current Battery Charge (%)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="100"
              value={initialSoc}
              onChange={(e) => setInitialSoc(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAddModalOpen(false);
                setError('');
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
