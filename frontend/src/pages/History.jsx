// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: History.jsx
// Description: User history records for sessions, reservations, and settlements
//              with aligned columns, formatted timestamps, and real session actions.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Calendar,
  CreditCard,
  Zap,
  Search,
  Inbox,
  ArrowUpDown,
  Play,
  FileText,
  Clock,
  Car,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chargingService } from '../services/chargingService';
import { reservationService } from '../services/reservationService';
import { paymentService } from '../services/paymentService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

// Readable Slot Formatter
function formatSlotRange(startTime, endTime) {
  if (!startTime) return '—';
  try {
    const s = new Date(startTime);
    if (isNaN(s.getTime())) return String(startTime);

    const dateStr = s.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const sTimeStr = s.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (endTime) {
      const e = new Date(endTime);
      if (!isNaN(e.getTime())) {
        const eTimeStr = e.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return `${dateStr}, ${sTimeStr} – ${eTimeStr}`;
      }
    }
    return `${dateStr}, ${sTimeStr}`;
  } catch {
    return String(startTime);
  }
}

// Readable Date/Time Formatter
function formatDateTime(dt) {
  if (!dt) return '—';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dt);
  }
}

export default function History() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'reservations', 'payments'
  const [sessions, setSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc', 'asc'

  const loadHistory = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
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
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Loading your activity records and transaction ledger..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '48px 16px', maxWidth: '480px', margin: '40px auto' }}>
          <HistoryIcon size={40} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Sign In Required</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Please sign in to view your past charging sessions, reservations, and wallet transactions.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Filter & Sort Sessions by actual Epoch Milliseconds
  const filteredSessions = safeSessions
    .filter((s) => {
      if (!s) return false;
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        s.stationName?.toLowerCase().includes(q) ||
        s.vehicleName?.toLowerCase().includes(q) ||
        s.chargerNumber?.toLowerCase().includes(q) ||
        String(s.sessionId || '').includes(q)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a?.endTime || a?.startTime || 0).getTime();
      const timeB = new Date(b?.endTime || b?.startTime || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // Filter & Sort Reservations by actual Epoch Milliseconds
  const filteredReservations = safeReservations
    .filter((r) => {
      if (!r) return false;
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        r.stationName?.toLowerCase().includes(q) ||
        r.vehicleName?.toLowerCase().includes(q) ||
        r.chargerNumber?.toLowerCase().includes(q) ||
        String(r.reservationId || '').includes(q)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a?.startTime || 0).getTime();
      const timeB = new Date(b?.startTime || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // Filter & Sort Payments by actual Epoch Milliseconds
  const filteredTransactions = safeTransactions
    .filter((t) => {
      if (!t) return false;
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        t.description?.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q) ||
        String(t.transactionId || '').includes(q)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a?.date || a?.timestamp || 0).getTime();
      const timeB = new Date(b?.date || b?.timestamp || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
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
            Charging Sessions ({safeSessions.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeTab === 'reservations' ? 'none' : 'transparent' }}
            onClick={() => setActiveTab('reservations')}
          >
            <Calendar size={14} />
            Reservations ({safeReservations.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: activeTab === 'payments' ? 'none' : 'transparent' }}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={14} />
            Wallet Ledger ({safeTransactions.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
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
            title="Toggle chronological sort order"
          >
            <ArrowUpDown size={14} />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      {/* SESSIONS TABLE VIEW */}
      {activeTab === 'sessions' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No charging sessions recorded
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '420px', margin: '0 auto 16px' }}>
                Initiate a charging session from a confirmed reservation or connect your EV at any station.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/stations')}>
                Explore Stations
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ minWidth: '920px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Session ID</th>
                    <th style={{ width: '220px' }}>Station & Hub</th>
                    <th style={{ width: '150px' }}>Bay / Connector</th>
                    <th style={{ width: '180px' }}>Vehicle</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Delivered</th>
                    <th style={{ width: '110px' }}>Duration</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Total Tariff</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => (
                    <tr key={s.sessionId}>
                      <td className="mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        #VX-S{String(s.sessionId).padStart(4, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.stationName}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {formatDateTime(s.startTime)}
                        </div>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 600 }}>{s.chargerNumber}</span>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{s.connectorType}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.vehicleName}</div>
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                        {Number(s.energyConsumedKwh || 0).toFixed(2)} kWh
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {s.durationMinutes != null ? `${s.durationMinutes} mins` : 'Active'}
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{Number(s.finalCost || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => navigate(`/payment/${s.sessionId}`)}
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* RESERVATIONS TABLE VIEW */}
      {activeTab === 'reservations' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No slot reservations found
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '420px', margin: '0 auto 16px' }}>
                You have no active or historical charging bay reservations.
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/stations')}>
                Reserve a Slot Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ minWidth: '980px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Ref ID</th>
                    <th style={{ width: '220px' }}>Station & Hub</th>
                    <th style={{ width: '150px' }}>Bay / Standard</th>
                    <th style={{ width: '240px' }}>Scheduled Interval</th>
                    <th style={{ width: '170px' }}>Registered EV</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Est. Tariff</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r) => {
                    const isGraceExpired = r.startTime && Date.now() > new Date(r.startTime).getTime() + 30 * 60 * 1000;
                    const isConfirmed = (r.status === 'CONFIRMED' || r.status === 'PENDING') && !isGraceExpired;
                    const displayStatus = isGraceExpired && (r.status === 'CONFIRMED' || r.status === 'PENDING') ? 'EXPIRED' : r.status;

                    return (
                      <tr key={r.reservationId}>
                        <td className="mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          VX-R{String(r.reservationId).padStart(4, '0')}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.stationName}</div>
                        </td>
                        <td>
                          <span className="mono" style={{ fontWeight: 600 }}>{r.chargerNumber}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                            {r.connectorType}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {formatSlotRange(r.startTime, r.endTime)}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.vehicleName || 'Registered EV'}</div>
                        </td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 800 }}>
                          ₹{Number(r.estimatedCost || 0).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusBadge status={displayStatus} size="sm" />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isConfirmed ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{
                                padding: '5px 10px',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#059669',
                              }}
                              onClick={() => navigate(`/charging?reservationId=${r.reservationId}`)}
                            >
                              <Play size={12} />
                              Plug In
                            </button>
                          ) : r.status === 'CANCELLED' ? (
                            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Cancelled</span>
                          ) : r.status === 'EXPIRED' || isGraceExpired ? (
                            <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 600 }}>Expired</span>
                          ) : r.status === 'COMPLETED' ? (
                            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Completed</span>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Concluded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WALLET LEDGER TABLE VIEW */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <Inbox size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No wallet transactions yet
              </h3>
              <p style={{ fontSize: '13.5px' }}>Top-ups, reservation holds, and session debits will appear in this ledger.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ minWidth: '880px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Txn ID</th>
                    <th style={{ width: '180px' }}>Timestamp</th>
                    <th style={{ width: '280px' }}>Transaction Description</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Entry Type</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => {
                    const isCredit = tx.type === 'CREDIT';
                    const formattedAmount = Number(tx.amount || 0).toFixed(2);
                    const formattedBalance = tx.balanceAfter != null ? `₹${Number(tx.balanceAfter).toFixed(2)}` : '—';
                    const txIdStr = tx.transactionId ? String(tx.transactionId) : String(idx + 1);

                    return (
                      <tr key={tx.transactionId || idx}>
                        <td className="mono" style={{ fontWeight: 600 }}>TX-{txIdStr.slice(-6)}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                          {formatDateTime(tx.date || tx.timestamp)}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {tx.description || 'Wallet transaction'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${isCredit ? 'badge-available' : 'badge-maintenance'}`}>
                            {tx.type || 'TX'}
                          </span>
                        </td>
                        <td
                          className="mono"
                          style={{
                            textAlign: 'right',
                            fontWeight: 800,
                            color: isCredit ? '#059669' : '#dc2626',
                          }}
                        >
                          {isCredit ? `+₹${formattedAmount}` : `-₹${formattedAmount}`}
                        </td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>
                          {formattedBalance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
