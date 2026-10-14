// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StationDetails.jsx
// Description: Technical hub view detailing chargers, dynamic pricing, and amenities.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Zap,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import ChargerCard from '../components/ChargerCard';
import StatusBadge from '../components/StatusBadge';
import Loading, { ErrorState } from '../components/Loading';
import { stationService } from '../services/stationService';

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCharger, setSelectedCharger] = useState(null);

  useEffect(() => {
    async function loadStation() {
      setLoading(true);
      try {
        const res = await stationService.getStationById(id);
        setStation(res.data);
        const firstAvailable = res.data.chargers?.find((c) => c.status === 'AVAILABLE');
        if (firstAvailable) setSelectedCharger(firstAvailable);
      } catch (err) {
        setError(err.message || 'Station not found');
      } finally {
        setLoading(false);
      }
    }
    loadStation();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading station hardware and connector status..." />
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="page-wrapper">
        <ErrorState error={error} retry={() => navigate('/stations')} />
      </div>
    );
  }

  const availableCount = station.chargers?.filter((c) => c.status === 'AVAILABLE').length || 0;
  const totalCount = station.chargers?.length || 0;

  return (
    <div className="page-wrapper">
      {/* Back Navigation Bar */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/stations')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          Back to Station Locator
        </button>
      </div>

      {/* Main Station Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{station.stationName}</h1>
              <StatusBadge status={station.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <MapPin size={16} style={{ color: 'var(--primary)' }} />
              <span>{station.address} &bull; {station.cityName}, {station.state}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/reservation/${station.stationId}`)}
              disabled={availableCount === 0}
            >
              <Calendar size={16} />
              Reserve a Bay
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bay Availability</span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: availableCount > 0 ? 'var(--primary)' : '#dc2626' }}>
              {availableCount} / {totalCount} Bays Free
            </div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Operating Hours</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{station.operatingHours || '24/7 Open'}</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base Energy Tariff</span>
            <div className="mono" style={{ fontSize: '18px', fontWeight: 700 }}>
              ₹{Number(station.basePricePerKwh || 14).toFixed(2)}/kWh
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Installed Charging Points */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Installed Chargers ({station.chargers?.length || 0} Units)
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Click an available bay to reserve
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {station.chargers?.map((ch) => (
              <ChargerCard
                key={ch.chargerId}
                charger={ch}
                selected={selectedCharger?.chargerId === ch.chargerId}
                onSelect={setSelectedCharger}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Pricing & Amenities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Pricing Structure */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
              Dynamic Tariff Schedule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                <span>Off-Peak (23:00 - 06:00)</span>
                <strong className="mono" style={{ color: '#059669' }}>₹10.50/kWh</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                <span>Standard (06:00 - 09:00, 12:00 - 18:00)</span>
                <strong className="mono">₹14.00/kWh</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
                <span>Peak (09:00 - 12:00, 18:00 - 22:00)</span>
                <strong className="mono" style={{ color: '#b45309' }}>₹18.50/kWh</strong>
              </div>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '12px' }}>
              * Idle fee applies if parked after charging is complete.
            </div>
          </div>

          {/* Station Amenities */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
              On-Site Amenities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {station.amenities?.map((am, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
