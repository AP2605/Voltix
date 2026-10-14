// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Wallet.jsx
// Description: Digital wallet interface reflecting real balance and audit ledger.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ShieldCheck,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Wallet() {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [topUpMethod, setTopUpMethod] = useState('UPI');
  const [processingTopUp, setProcessingTopUp] = useState(false);

  const loadWalletData = async () => {
    if (!currentUser) return;
    try {
      const res = await paymentService.getWallet(currentUser.userId);
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to load wallet:', err);
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
    setProcessingTopUp(true);
    try {
      await paymentService.addMoney(currentUser.userId, topUpAmount, topUpMethod);
      await loadWalletData();
      setTopUpModalOpen(false);
    } catch (err) {
      alert(err.message || 'Top-up failed');
    } finally {
      setProcessingTopUp(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Fetching digital wallet balance..." />
      </div>
    );
  }

  const currentBalance = wallet ? wallet.balance : 0.0;
  const transactions = wallet?.transactions || [];

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Prepaid Digital Wallet</h1>
          <p className="header-subtitle">
            Manage your balance for frictionless, contactless charging settlements
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setTopUpModalOpen(true)}>
          <Plus size={16} />
          Add Money to Wallet
        </button>
      </div>

      {/* Wallet Balance Visual Card */}
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
                color: 'var(--primary)',
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
            onClick={() => setTopUpModalOpen(true)}
            style={{ padding: '8px 18px' }}
          >
            <Plus size={14} />
            Quick Top-Up
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94a3b8' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            <span>Instant Balance Updates &bull; Automated Settlement</span>
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

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Inbox size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              No transactions recorded yet
            </p>
            <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 16px' }}>
              Top up your wallet balance to start charging at any VOLTIX station.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setTopUpModalOpen(true)}>
              <Plus size={14} />
              Add ₹1,000 Now
            </button>
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
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  const isDebit = tx.type === 'DEBIT';

                  return (
                    <tr key={tx.transactionId}>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        TX-{tx.transactionId.toString().slice(-6)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{tx.date}</td>
                      <td style={{ fontWeight: 500 }}>{tx.description}</td>
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
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className="mono"
                        style={{
                          fontWeight: 700,
                          color: isCredit ? '#059669' : '#dc2626',
                        }}
                      >
                        {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`}
                      </td>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>
                        ₹{tx.balanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top-Up Modal */}
      <Modal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        title="Add Money to Digital Wallet"
      >
        <form onSubmit={handleTopUpSubmit}>
          <div className="form-group">
            <label className="form-label">Select Pre-Set Amount</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['500', '1000', '2000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`btn ${topUpAmount === amt ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTopUpAmount(amt)}
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
              max="20000"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Channel</label>
            <select
              className="form-control"
              value={topUpMethod}
              onChange={(e) => setTopUpMethod(e.target.value)}
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
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={processingTopUp}>
              {processingTopUp ? 'Adding Funds...' : `Add ₹${Number(topUpAmount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
