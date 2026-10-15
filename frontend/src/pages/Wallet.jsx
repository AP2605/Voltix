// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Wallet.jsx
// Description: Digital wallet interface reflecting real balance and audit ledger.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ShieldCheck,
  Inbox,
  AlertTriangle,
  AlertCircle,
  LogIn,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import { dataStore } from '../services/dataStore';
import Modal from '../components/Modal';
import Loading, { ErrorState } from '../components/Loading';

export default function Wallet() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Top-Up Modal State
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [topUpMethod, setTopUpMethod] = useState('UPI');
  const [processingTopUp, setProcessingTopUp] = useState(false);
  const [topUpError, setTopUpError] = useState('');

  const loadWalletData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await paymentService.getWallet(currentUser.userId);
      setWallet(res.data);
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend wallet API failed, attempting offline store fallback:', err);
      try {
        const offlineWallet = dataStore.getWallet(currentUser.userId);
        if (offlineWallet) {
          setWallet(offlineWallet);
          setIsOffline(true);
        } else {
          setError(err.message || 'Failed to load digital wallet balance.');
        }
      } catch (fallbackErr) {
        setError(err.message || 'Failed to load digital wallet.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [currentUser]);

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    const numAmount = Number(topUpAmount);
    if (!numAmount || numAmount < 100) {
      setTopUpError('Minimum top-up amount is ₹100.');
      return;
    }
    setProcessingTopUp(true);
    setTopUpError('');
    try {
      await paymentService.addMoney(currentUser.userId, numAmount, topUpMethod);
      await loadWalletData();
      setTopUpModalOpen(false);
    } catch (err) {
      setTopUpError(err.message || 'Top-up transaction failed. Please try again.');
    } finally {
      setProcessingTopUp(false);
    }
  };

  // State 1: Loading State
  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Fetching digital wallet balance and ledger records..." />
      </div>
    );
  }

  // State 2: Unauthenticated State
  if (!currentUser) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <LogIn size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>
            Please sign in to access your prepaid wallet, transaction ledger, and payment balances.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Sign In to VOLTIX
          </button>
        </div>
      </div>
    );
  }

  // State 3: Error State with Retry Button
  if (error && !wallet) {
    return (
      <div className="page-wrapper">
        <ErrorState error={error} retry={loadWalletData} />
      </div>
    );
  }

  const currentBalance = Number(wallet?.balance != null ? wallet.balance : 0.0);
  const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
  const isZeroBalance = currentBalance <= 0;
  const isLowBalance = currentBalance > 0 && currentBalance < 200;

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="header-title">Prepaid Digital Wallet</h1>
            {isOffline && (
              <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <WifiOff size={11} /> Offline Cached
              </span>
            )}
          </div>
          <p className="header-subtitle">
            Manage your balance for frictionless, contactless charging settlements
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={loadWalletData} title="Refresh balance">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => { setTopUpError(''); setTopUpModalOpen(true); }}>
            <Plus size={16} />
            Add Money to Wallet
          </button>
        </div>
      </div>

      {/* State 4: Zero Balance Alert */}
      {isZeroBalance && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            marginBottom: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '14.5px', color: 'var(--text-main)', display: 'block' }}>
                Zero Wallet Balance
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Your wallet balance is ₹0.00. Add funds to unlock EV charging bays and reserve slots.
              </span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setTopUpError(''); setTopUpModalOpen(true); }}>
            <Plus size={14} />
            Top Up ₹1,000 Now
          </button>
        </div>
      )}

      {/* State 6: Low Balance Warning (< ₹200) */}
      {isLowBalance && (
        <div
          className="card"
          style={{
            borderLeft: '4px solid #f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            marginBottom: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={22} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '14.5px', color: 'var(--text-main)', display: 'block' }}>
                Low Balance Warning (Below ₹200)
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Your current balance of ₹{currentBalance.toFixed(2)} may be insufficient for high-capacity fast charging sessions.
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setTopUpError(''); setTopUpModalOpen(true); }}>
            Quick Top-Up
          </button>
        </div>
      )}

      {/* State 5: Wallet Balance Visual Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
              Available Balance
            </span>
            <div
              className="mono"
              style={{
                fontSize: '48px',
                fontWeight: 800,
                color: isZeroBalance ? '#ef4444' : isLowBalance ? '#f59e0b' : 'var(--primary)',
                marginTop: '8px',
                lineHeight: 1,
              }}
            >
              ₹{currentBalance.toFixed(2)}
            </div>
            <span style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '12px', display: 'block' }}>
              Account Holder: <strong>{currentUser?.name || 'Driver'}</strong> ({currentUser?.email})
            </span>
          </div>

          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--primary)',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <WalletIcon size={36} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => { setTopUpError(''); setTopUpModalOpen(true); }}
            style={{ padding: '8px 18px' }}
          >
            <Plus size={14} />
            Quick Top-Up
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94a3b8' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span>Instant Balance Updates &bull; Automated Session Settlement</span>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Transaction History</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Audit ledger of wallet deposits and charging debits
            </p>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Total: {transactions.length} records
          </span>
        </div>

        {/* State 7: Empty Transaction History */}
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Inbox size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              No transactions recorded yet
            </p>
            <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 16px' }}>
              Top up your wallet balance to start charging at any VOLTIX station.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => { setTopUpError(''); setTopUpModalOpen(true); }}>
              <Plus size={14} />
              Add ₹1,000 Now
            </button>
          </div>
        ) : (
          /* State 8: Safe Transaction Table */
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
                {transactions.map((tx, idx) => {
                  const isCredit = tx.type === 'CREDIT';
                  const isDebit = tx.type === 'DEBIT';
                  const formattedAmt = Number(tx.amount || 0).toFixed(2);
                  const formattedBal = tx.balanceAfter != null ? `₹${Number(tx.balanceAfter).toFixed(2)}` : '—';
                  const rawId = tx.transactionId ? tx.transactionId.toString() : String(idx + 1);

                  return (
                    <tr key={tx.transactionId || idx}>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        TX-{rawId.slice(-6)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {tx.date || tx.timestamp || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {tx.description || (isCredit ? 'Prepaid Deposit' : 'Charging Session Settlement')}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isCredit ? 'badge-available' : isDebit ? 'badge-maintenance' : 'badge-reserved'
                          }`}
                          style={{ fontSize: '11px' }}
                        >
                          {isCredit && <ArrowDownLeft size={11} />}
                          {isDebit && <ArrowUpRight size={11} />}
                          {!isCredit && !isDebit && <RotateCcw size={11} />}
                          {tx.type || 'TX'}
                        </span>
                      </td>
                      <td
                        className="mono"
                        style={{
                          fontWeight: 700,
                          color: isCredit ? '#059669' : '#dc2626',
                        }}
                      >
                        {isCredit ? `+₹${formattedAmt}` : `-₹${formattedAmt}`}
                      </td>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>
                        {formattedBal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* State 9: Top-Up Modal */}
      <Modal
        isOpen={topUpModalOpen}
        onClose={() => { if (!processingTopUp) setTopUpModalOpen(false); }}
        title="Add Money to Digital Wallet"
      >
        <form onSubmit={handleTopUpSubmit}>
          {topUpError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{topUpError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Pre-Set Amount</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['500', '1000', '2000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`btn ${topUpAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTopUpAmount(amt)}
                  disabled={processingTopUp}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Or Custom Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              min="100"
              max="50000"
              required
              disabled={processingTopUp}
            />
            <small style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Minimum deposit is ₹100.00
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Channel</label>
            <select
              className="form-control"
              value={topUpMethod}
              onChange={(e) => setTopUpMethod(e.target.value)}
              disabled={processingTopUp}
            >
              <option value="UPI">UPI Instant (Google Pay, PhonePe, Paytm)</option>
              <option value="Net Banking">Net Banking (HDFC, SBI, ICICI)</option>
              <option value="Card">Debit / Credit Card</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setTopUpModalOpen(false)}
              disabled={processingTopUp}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={processingTopUp}>
              {processingTopUp ? 'Processing Deposit...' : `Add ₹${Number(topUpAmount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
