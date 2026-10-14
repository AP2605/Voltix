// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: History.jsx
// Description: User history records for sessions, reservations, and settlements.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Calendar,
  CreditCard,
  Zap,
  Search,
  Inbox,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chargingService } from '../services/chargingService';
import { reservationService } from '../services/reservationService';
import { paymentService } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

export default function History() {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'reservations', 'payments'
  const [sessions, setSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc', 'asc'

  useEffect(() => {
    async function loadHistory() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [sessRes, resvRes, walletRes] = await Promise.all([
          chargingService.getChargingHistory(currentUser.userId),
          reservationService.getReservations(currentUser.userId),
          paymentService.getWallet(currentUser.userId),
        ]);
        setSessions(sessRes.data || []);
        setReservations(resvRes.data || []);
        setTransactions(walletRes.data?.transactions || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading your activity records..." />
      </div>
    );
  }

  // Filter & Sort Sessions
  const filteredSessions = sessions
    .filter(
      (s) =>
        s.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.chargerNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.endTime || a.startTime);
      const dateB = new Date(b.endTime || b.startTime);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Filter & Sort Reservations
  const filteredReservations = reservations
    .filter(
      (r) =>
        r.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.chargerNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Filter & Sort Payments
  const filteredTransactions = transactions
    .filter((t) => t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Activity Records & History</h1>
          <p className="header-subtitle">
            View completed charging sessions, reserved slots, and billing transactions
          </p>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeTab === 'sessions' ? 'none' : 'transparent' }}
            onClick={() => setActiveTab('sessions')}
          >
            <Zap size={14} />
            Charging Sessions ({sessions.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeTab === 'reservations' ? 'none' : 'transparent' }}
            onClick={() => setActiveTab('reservations')}
          >
            <Calendar size={14} />
            Reservations ({reservations.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeTab === 'payments' ? 'none' : 'transparent' }}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={14} />
            Wallet Ledger ({transactions.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            title="Toggle sort order"
          >
            <ArrowUpDown size={14} />
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Sessions Table View */}
      {activeTab === 'sessions' && (
        <div className="card">
          {filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No charging sessions recorded
              </h3>
              <p style={{ fontSize: '13.5px' }}>Completed charging sessions will appear here with energy and tariff details.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Station & Bay</th>
                    <th>Vehicle</th>
                    <th>Energy (kWh)</th>
                    <th>Duration</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.sessionId}>
                      <td className="mono" style={{ fontWeight: 600 }}>#{s.sessionId.toString().slice(-6)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.stationName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.chargerNumber} ({s.connectorType})</div>
                      </td>
                      <td>{s.vehicleName}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{s.energyConsumedKwh || 0} kWh</td>
                      <td>{s.durationMinutes || 0} min</td>
                      <td className="mono" style={{ fontWeight: 700 }}>₹{(s.finalCost || 0).toFixed(2)}</td>
                      <td><StatusBadge status={s.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reservations Table View */}
      {activeTab === 'reservations' && (
        <div className="card">
          {filteredReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No slot reservations found
              </h3>
              <p style={{ fontSize: '13.5px' }}>Reserved charging slots will be listed here with scheduled intervals.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Station</th>
                    <th>Bay</th>
                    <th>Scheduled Slot</th>
                    <th>Vehicle</th>
                    <th>Est. Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => (
                    <tr key={r.reservationId}>
                      <td className="mono" style={{ fontWeight: 600 }}>VX-{r.reservationId.toString().slice(-6)}</td>
                      <td style={{ fontWeight: 600 }}>{r.stationName}</td>
                      <td className="mono">{r.chargerNumber} ({r.connectorType})</td>
                      <td className="mono" style={{ fontSize: '12.5px' }}>{r.startTime}</td>
                      <td>{r.vehicleName}</td>
                      <td className="mono">₹{(r.estimatedCost || 0).toFixed(2)}</td>
                      <td><StatusBadge status={r.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments Table View */}
      {activeTab === 'payments' && (
        <div className="card">
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No wallet transactions yet
              </h3>
              <p style={{ fontSize: '13.5px' }}>Top-ups and session debits will appear in this ledger.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Timestamp</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td className="mono" style={{ fontWeight: 600 }}>TX-{tx.transactionId.toString().slice(-6)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.date}</td>
                      <td style={{ fontWeight: 500 }}>{tx.description}</td>
                      <td>
                        <span className={`badge ${tx.type === 'CREDIT' ? 'badge-available' : 'badge-maintenance'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="mono" style={{ fontWeight: 700, color: tx.type === 'CREDIT' ? '#059669' : '#dc2626' }}>
                        {tx.type === 'CREDIT' ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`}
                      </td>
                      <td className="mono">₹{tx.balanceAfter.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
