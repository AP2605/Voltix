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
import StationMap from '../components/StationMap';
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

          {/* Genuine Geographic Interactive Leaflet Map */}
          <StationMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            height="440px"
          />

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
