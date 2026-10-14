// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: StatCard.jsx
// Description: Reusable KPI card for dashboard metrics.
// ============================================================================

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {trend !== undefined && (
          <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trend)}%</span>
            <span style={{ color: 'var(--text-muted)' }}>{trendLabel || 'vs last month'}</span>
          </div>
        )}
        {subtext && !trend && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
