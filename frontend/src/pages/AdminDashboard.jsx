// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: AdminDashboard.jsx
// Description: Network-wide executive intelligence portal with dynamic data aggregation.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Zap,
  DollarSign,
  Leaf,
  Activity,
  MapPin,
  Shield,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { dataStore } from '../services/dataStore';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalChargers: 0,
    activeChargers: 0,
    totalEnergyDeliveredKwh: 0,
    totalRevenueInr: 0,
    co2AvoidedTons: 0,
    completedSessionsCount: 0,
  });

  const [stations, setStations] = useState([]);

  useEffect(() => {
    const netMetrics = dataStore.getNetworkMetrics();
    setMetrics(netMetrics);
    const stList = dataStore.getStations();
    setStations(stList);
  }, []);

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="role-tag admin">ADMINISTRATION HUB</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Central Grid Operations Center</span>
          </div>
          <h1 className="header-title">Network Executive Intelligence</h1>
          <p className="header-subtitle">
            Consolidated KPIs aggregated across all operational metropolitan charging hubs
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid-3" style={{ marginBottom: '20px' }}>
        <StatCard
          title="Total Registered Drivers"
          value={metrics.totalUsers}
          icon={Users}
          subtext="Active driver accounts"
        />
        <StatCard
          title="Operational EV Hubs"
          value={`${metrics.totalStations} Stations`}
          icon={Building2}
          subtext="Connected metro clusters"
        />
        <StatCard
          title="Fast Charging Guns"
          value={`${metrics.totalChargers} Chargers`}
          icon={Zap}
          subtext={`${metrics.activeChargers} Operational`}
        />
      </div>

      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Total Energy Delivered"
          value={`${metrics.totalEnergyDeliveredKwh} kWh`}
          icon={Activity}
          subtext="Actual metred consumption"
        />
        <StatCard
          title="Settled Revenue"
          value={`₹${metrics.totalRevenueInr.toFixed(2)}`}
          icon={DollarSign}
          subtext="Total transaction settlement"
        />
        <StatCard
          title="CO2 Emissions Avoided"
          value={`${metrics.co2AvoidedTons} Tons`}
          icon={Leaf}
          subtext="0.82 kg/kWh conversion standard"
        />
      </div>

      {/* Network Stations Fleet Overview */}
      <div className="card">
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
          Network Station Performance
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Installed infrastructure and real-time bay availability across cities
        </p>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Station ID</th>
                <th>Station Name</th>
                <th>City & State</th>
                <th>Total Bays</th>
                <th>Available Bays</th>
                <th>Base Tariff</th>
                <th>Operating Status</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((st) => (
                <tr key={st.stationId}>
                  <td className="mono" style={{ fontWeight: 600 }}>STN-0{st.stationId}</td>
                  <td style={{ fontWeight: 600 }}>{st.stationName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{st.cityName}, {st.state}</span>
                    </div>
                  </td>
                  <td className="mono">{st.totalChargersCount} Bays</td>
                  <td className="mono" style={{ fontWeight: 600, color: st.availableChargersCount > 0 ? 'var(--primary)' : '#dc2626' }}>
                    {st.availableChargersCount} Available
                  </td>
                  <td className="mono">₹{st.basePricePerKwh.toFixed(2)}/kWh</td>
                  <td>
                    <span className="badge badge-available">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
