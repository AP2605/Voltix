// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Stations.jsx
// Description: Station search & discovery locator with interactive map visualization.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, SlidersHorizontal, Navigation, Plus, Minus, Layers, Zap } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StationCard from '../components/StationCard';
import Loading, { EmptyState } from '../components/Loading';
import { stationService } from '../services/stationService';
import '../styles/stations.css';

export default function Stations() {
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    cityId: '',
    connectorType: '',
    speedCategory: '',
    availableOnly: false,
    minRating: '',
  });

  const loadStations = async () => {
    setLoading(true);
    try {
      const [stationRes, cityRes] = await Promise.all([
        stationService.getStations(filters),
        stationService.getCities(),
      ]);
      setStations(stationRes.data);
      setCities(cityRes.data);
      if (stationRes.data.length > 0 && !selectedStation) {
        setSelectedStation(stationRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      cityId: '',
      connectorType: '',
      speedCategory: '',
      availableOnly: false,
      minRating: '',
    });
  };

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Charging Station Locator</h1>
          <p className="header-subtitle">
            Search, filter, and inspect operational charging hubs across {cities.length || 6} cities
          </p>
        </div>
      </div>

      <div className="stations-layout">
        {/* Left: Filter Panel */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          cities={cities}
        />

        {/* Right: Search Toolbar, Map Box & Cards */}
        <main className="stations-main">
          <div className="stations-toolbar">
            <SearchBar
              value={filters.search}
              onChange={(val) => setFilters({ ...filters, search: val })}
              placeholder="Search station name, city, or address..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{stations.length}</strong> hubs
            </div>
          </div>

          {/* Interactive Simulated Map Box */}
          <div className="map-view-box">
            <div className="map-grid-pattern" />

            {/* Map Controls */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                zIndex: 10,
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
                title="Zoom in"
              >
                <Plus size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
                title="Zoom out"
              >
                <Minus size={14} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
                title="Map Layers"
              >
                <Layers size={14} />
              </button>
            </div>

            {/* City Center Marker Label */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(17, 24, 39, 0.85)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #374151',
              }}
            >
              <Navigation size={13} style={{ color: 'var(--primary)' }} />
              <span>Grid Map Mode &bull; Real-Time Geo Tracking</span>
            </div>

            {/* Render Simulated Station Markers */}
            {stations.slice(0, 7).map((s, idx) => {
              // Deterministic spread across canvas based on index
              const positions = [
                { top: '35%', left: '25%' },
                { top: '60%', left: '40%' },
                { top: '45%', left: '65%' },
                { top: '25%', left: '75%' },
                { top: '75%', left: '20%' },
                { top: '30%', left: '50%' },
                { top: '70%', left: '80%' },
              ];
              const pos = positions[idx % positions.length];
              const isSelected = selectedStation?.stationId === s.stationId;

              return (
                <div
                  key={s.stationId}
                  className={`map-pin ${isSelected ? 'active' : ''}`}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setSelectedStation(s)}
                >
                  <div className="map-pin-bubble">
                    <Zap size={12} style={{ color: isSelected ? '#ffffff' : 'var(--primary)' }} />
                    <span>{s.stationName.split(' ')[0]}</span>
                  </div>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: isSelected ? 'var(--primary)' : '#ffffff',
                      borderRadius: '50%',
                      marginTop: '4px',
                      boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Results Grid */}
          {loading ? (
            <Loading message="Filtering station coordinates and live gun states..." />
          ) : stations.length === 0 ? (
            <EmptyState
              title="No stations match your criteria"
              description="Try adjusting your connector standard or speed filters to view other available stations."
              action={
                <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              }
            />
          ) : (
            <div className="grid-2">
              {stations.map((station) => (
                <StationCard key={station.stationId} station={station} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
