// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Payment.jsx
// Description: Invoice settlement interface derived strictly from completed
//              charging session records and real wallet balances.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Wallet,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Receipt,
  FileText,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import { dataStore } from '../services/dataStore';
import Loading, { ErrorState } from '../components/Loading';

export default function Payment() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [error, setError] = useState('');

  // Selected method: 'WALLET', 'UPI', 'CARD'
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  useEffect(() => {
    async function loadPaymentData() {
      if (!currentUser) return;
      try {
        const userSessions = dataStore.getSessions(currentUser.userId);
        const targetSession = userSessions.find((s) => s.sessionId === Number(sessionId)) || userSessions[0];
        setSession(targetSession || null);

        const res = await paymentService.getWallet(currentUser.userId);
        setWallet(res.data);
      } catch (err) {
        console.error('Failed to load payment data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentData();
  }, [sessionId, currentUser]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'VOLTIXNEW') {
      setDiscountApplied(50.0);
      setError('');
    } else if (promoCode.toUpperCase() === 'PEAKSAVER') {
      setDiscountApplied(100.0);
      setError('');
    } else {
      setError('Invalid promotion code. Valid demo codes: VOLTIXNEW, PEAKSAVER.');
    }
  };

  const handleProcessPayment = async () => {
    if (!session) return;
    setPaying(true);
    setError('');
    try {
      const payload = {
        sessionId: session.sessionId,
        userId: currentUser.userId,
        amount: finalAmount,
        paymentMethod: paymentMethod,
      };
      const res = await paymentService.processPayment(payload);
      setPaymentSuccess(res.data);

      // Refresh wallet balance
      const updatedWallet = dataStore.getWallet(currentUser.userId);
      setWallet(updatedWallet);
    } catch (err) {
      setError(err.message || 'Payment failed. Please check your wallet balance.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Fetching billing statement and wallet balance..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
          <Receipt size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Pending Invoices</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            There are no unsettled charging sessions on your account.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Billing line items derived strictly from completed session record
  const energyConsumed = session.energyConsumedKwh || 0;
  const ratePerKwh = session.pricePerKwh || 14.0;
  const baseCost = +(energyConsumed * ratePerKwh).toFixed(2);
  const reservationFee = session.reservationId ? 50.0 : 0.0;
  const finalAmount = Math.max(0, +(baseCost + reservationFee - discountApplied).toFixed(2));
  const isWalletInsufficient = paymentMethod === 'WALLET' && wallet && wallet.balance < finalAmount;

  // Confirmation Success View
  if (paymentSuccess) {
    return (
      <div className="page-wrapper" style={{ maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-available-bg)',
              color: 'var(--status-available)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
            Payment Settled Successfully
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
            Invoice paid and logged in your digital account ledger.
          </p>

          <div
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Transaction Reference</span>
              <strong className="mono" style={{ color: 'var(--primary)' }}>{paymentSuccess.transactionRef}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Session ID</span>
              <strong className="mono">#{paymentSuccess.sessionId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Payment Method</span>
              <span style={{ fontWeight: 600 }}>{paymentSuccess.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Energy Delivered</span>
              <span className="mono">{energyConsumed} kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-card)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Settled Total</span>
              <strong className="mono" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                ₹{paymentSuccess.amount.toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/wallet')}>
              View Wallet Balance
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="header-title">Invoice Settlement</h1>
          <p className="header-subtitle">
            Billing statement for completed charging session #{session.sessionId.toString().slice(-4)}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            borderColor: '#fecaca',
            background: '#fef2f2',
            marginBottom: '20px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ color: '#991b1b', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Payment Method Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Select Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Wallet Option */}
              <div
                onClick={() => setPaymentMethod('WALLET')}
                style={{
                  padding: '16px',
                  border: `2px solid ${paymentMethod === 'WALLET' ? 'var(--primary)' : 'var(--border-card)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: paymentMethod === 'WALLET' ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-page)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <Wallet size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>VOLTIX Digital Wallet</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Available balance: <strong className="mono">₹{(wallet?.balance || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'WALLET'}
                  onChange={() => setPaymentMethod('WALLET')}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>

              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                style={{
                  padding: '16px',
                  border: `2px solid ${paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border-card)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: paymentMethod === 'UPI' ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-page)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0ea5e9',
                    }}
                  >
                    <QrCode size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>Instant UPI</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM
                    </div>
                  </div>
                </div>

                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Credit/Debit Card Option */}
              <div
                onClick={() => setPaymentMethod('CARD')}
                style={{
                  padding: '16px',
                  border: `2px solid ${paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border-card)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: paymentMethod === 'CARD' ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-page)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6366f1',
                    }}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Visa &bull; Mastercard &bull; RuPay
                    </div>
                  </div>
                </div>

                <input
                  type="radio"
                  name="pm"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Promo Code Card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
              Promotional Voucher
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter promo (e.g. VOLTIXNEW)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleApplyPromo}>
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Itemized Invoice Breakdown */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '96px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Receipt size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Itemized Invoice</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Station</span>
                <span style={{ fontWeight: 600 }}>{session.stationName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hardware Charger</span>
                <span className="mono">{session.chargerNumber} ({session.connectorType})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Duration</span>
                <span className="mono">{session.durationMinutes || 1} min</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Energy Consumed</span>
                <span className="mono">{energyConsumed} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Energy Rate</span>
                <span className="mono">₹{ratePerKwh.toFixed(2)}/kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Energy Total</span>
                <span className="mono">₹{baseCost.toFixed(2)}</span>
              </div>
              {reservationFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Slot Lock Fee</span>
                  <span className="mono">₹{reservationFee.toFixed(2)}</span>
                </div>
              )}
              {discountApplied > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Promo Discount</span>
                  <span className="mono">-₹{discountApplied.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: '2px dashed var(--border-card)',
                paddingTop: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Total Payable</span>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{finalAmount.toFixed(2)}
              </div>
            </div>

            {isWalletInsufficient && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '12.5px',
                  color: '#991b1b',
                }}
              >
                Insufficient wallet balance. Please top up funds or select UPI/Card.
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={handleProcessPayment}
              disabled={paying || isWalletInsufficient}
            >
              {paying ? 'Authorizing Payment...' : `Pay ₹${finalAmount.toFixed(2)}`}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
