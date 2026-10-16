// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StationMap.jsx
// Description: Interactive geographic map with OpenStreetMap tiles, custom
//              Voltix status pins, auto-pan/zoom on search, and synchronized popups.
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Pin generator for Voltix stations
function createPinIcon(status = 'AVAILABLE', isSelected = false) {
  let pinColor = '#10b981'; // Emerald (Available)
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (status === 'OCCUPIED' || status === 'IN_USE') {
    pinColor = '#f59e0b'; // Amber (Occupied)
    glowColor = 'rgba(245, 158, 11, 0.4)';
  } else if (status === 'MAINTENANCE' || status === 'OFFLINE') {
    pinColor = '#6b7280'; // Gray (Maintenance)
    glowColor = 'rgba(107, 114, 128, 0.4)';
  }

  const pulseHtml = isSelected
    ? `<div style="position: absolute; top: -8px; left: -8px; width: 48px; height: 48px; border-radius: 50%; background: ${glowColor}; animation: voltixPulse 1.8s infinite ease-out; z-index: 1;"></div>`
    : '';

  const border = isSelected ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.9)';
  const transform = isSelected ? 'scale(1.2)' : 'scale(1.0)';

  const html = `
    <div style="position: relative; width: 32px; height: 32px; cursor: pointer; transition: transform 0.2s ease;">
      ${pulseHtml}
      <div style="position: relative; z-index: 2; width: 32px; height: 32px; border-radius: 50%; background: ${pinColor}; border: ${border}; transform: ${transform}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'voltix-leaflet-marker',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export default function StationMap({
  stations = [],
  selectedStation = null,
  onSelectStation = () => {},
  height = '420px',
  searchQuery = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const prevStationsKeyRef = useRef('');
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: South India hub / Chennai
      const defaultCenter = [13.04, 80.22];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: true,
      });

      // Standard OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Voltix EV Network',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers and bounds when stations list updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    if (!stations || stations.length === 0) return;

    const bounds = L.latLngBounds([]);
    const validStations = [];

    stations.forEach((station) => {
      const lat = parseFloat(station.latitude);
      const lng = parseFloat(station.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      validStations.push({ ...station, lat, lng });
      bounds.extend([lat, lng]);

      const isSelected = selectedStation?.stationId === station.stationId;
      const status = station.status || 'AVAILABLE';
      const icon = createPinIcon(status, isSelected);

      const marker = L.marker([lat, lng], { icon });

      // Build rich, actionable popup
      const availableChargers = (station.chargers || []).filter(
        (c) => c.status === 'AVAILABLE'
      ).length;
      const totalChargers = station.chargers?.length || 4;

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.style.fontFamily = 'inherit';
      popupContent.innerHTML = `
        <div style="font-weight: 700; font-size: 14.5px; color: #0f172a; margin-bottom: 4px;">
          ${station.stationName}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
          ${station.address || station.cityName || ''}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
          <span style="color: #64748b;">Live Availability:</span>
          <strong style="color: ${availableChargers > 0 ? '#10b981' : '#ef4444'};">
            ${availableChargers} / ${totalChargers} Bays Free
          </strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px;">
          <span style="color: #64748b;">Tariff:</span>
          <strong style="color: #0f172a;">₹${Number(station.basePricePerKwh || 14.0).toFixed(2)}/kWh</strong>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="reserve-btn-${station.stationId}" style="flex: 1; background: #10b981; color: #ffffff; border: none; padding: 7px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Reserve Bay
          </button>
          <button id="details-btn-${station.stationId}" style="flex: 1; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 7px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
            Details
          </button>
        </div>
      `;

      // Attach button event listeners
      const reserveBtn = popupContent.querySelector(`#reserve-btn-${station.stationId}`);
      if (reserveBtn) {
        reserveBtn.onclick = (e) => {
          e.stopPropagation();
          navigate(`/reservation/${station.stationId}`);
        };
      }

      const detailsBtn = popupContent.querySelector(`#details-btn-${station.stationId}`);
      if (detailsBtn) {
        detailsBtn.onclick = (e) => {
          e.stopPropagation();
          navigate(`/stations/${station.stationId}`);
        };
      }

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectStation(station);
      });

      markersLayer.addLayer(marker);
      markersMapRef.current.set(station.stationId, marker);
    });

    // Check if stations list actually changed to avoid jittery movements
    const currentStationsKey = validStations.map((s) => s.stationId).join(',');
    const hasStationsChanged = currentStationsKey !== prevStationsKeyRef.current;
    prevStationsKeyRef.current = currentStationsKey;

    if (hasStationsChanged && bounds.isValid()) {
      if (validStations.length === 1) {
        // Single match: pan and zoom in closely to the station
        const s = validStations[0];
        map.flyTo([s.lat, s.lng], 15, { duration: 1.0 });
        const marker = markersMapRef.current.get(s.stationId);
        if (marker) {
          setTimeout(() => marker.openPopup(), 400);
        }
      } else if (validStations.length > 1) {
        // Multiple matches: fit bounds to include all matching stations
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
        });
      }
    }
  }, [stations]);

  // Center on selected station and open its popup when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStation) return;

    const lat = parseFloat(selectedStation.latitude);
    const lng = parseFloat(selectedStation.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 15, { duration: 0.8 });
      const marker = markersMapRef.current.get(selectedStation.stationId);
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  }, [selectedStation]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px',
      }}
    >
      <style>{`
        @keyframes voltixPulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          padding: 4px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
