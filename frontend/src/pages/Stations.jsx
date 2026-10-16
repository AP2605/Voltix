// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Stations.jsx
// Description: Station search & discovery locator with interactive map visualization.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [searchInput, setSearchInput] = useState('');
  const [networkError, setNetworkError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    cityId: '',
    connectorType: '',
    speedCategory: '',
    availableOnly: false,
    minRating: '',
  });

  // Request cancellation tracker to prevent race conditions
  const requestIdRef = useRef(0);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load cities once on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const cityRes = await stationService.getCities();
        setCities(cityRes.data || []);
      } catch (err) {
        console.warn('Failed to load cities:', err);
      }
    }
    loadCities();
  }, []);

  // Fetch stations when filters change
  useEffect(() => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    setNetworkError('');

    async function fetchFilteredStations() {
      try {
        const stationRes = await stationService.getStations(filters);
        // Only apply if this is still the latest request
        if (currentReqId === requestIdRef.current) {
          const fetchedStations = stationRes.data || [];
          setStations(fetchedStations);

          if (fetchedStations.length > 0) {
            // If previous selected station is in results, keep it, otherwise pick first
            setSelectedStation((prev) => {
              if (prev && fetchedStations.some((s) => s.stationId === prev.stationId)) {
                return prev;
              }
              return fetchedStations[0];
            });
          } else {
            setSelectedStation(null);
          }
        }
      } catch (err) {
        if (currentReqId === requestIdRef.current) {
          console.error('Failed to load stations:', err);
          setNetworkError(err.message || 'Unable to load charging stations.');
        }
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    fetchFilteredStations();
  }, [filters]);

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      cityId: '',
      connectorType: '',
      speedCategory: '',
      availableOnly: false,
      minRating: '',
    });
  };

  const handleSelectStation = (station) => {
    setSelectedStation(station);
  };

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Charging Station Locator</h1>
          <p className="header-subtitle">
            Search, filter, and inspect operational charging hubs across {cities.length || 8} cities
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
              value={searchInput}
              onChange={(val) => setSearchInput(val)}
              placeholder="Search station name, city, or address..."
            />
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{stations.length}</strong> hubs
            </div>
          </div>

          {networkError && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-md)',
                color: '#991b1b',
                fontSize: '13.5px',
                marginBottom: '16px',
              }}
            >
              ⚠️ {networkError}
            </div>
          )}

          {/* Genuine Geographic Interactive Leaflet Map */}
          <StationMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
            height="440px"
            searchQuery={filters.search}
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
                <StationCard
                  key={station.stationId}
                  station={station}
                  isSelected={selectedStation?.stationId === station.stationId}
                  onSelect={handleSelectStation}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
