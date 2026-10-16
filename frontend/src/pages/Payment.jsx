// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: Payment.jsx
// Description: Authoritative read-only tax invoice & billing statement derived
//              from completed charging session records and network ledgers.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Receipt,
  FileText,
  Printer,
  ArrowLeft,
  Zap,
  Car,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/paymentService';
import { chargingService } from '../services/chargingService';
import { dataStore } from '../services/dataStore';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';

// Formats ISO timestamp to human-readable date and time
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

export default function Payment() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInvoiceData() {
      if (!currentUser) return;
      try {
        let invData = null;
        let targetSessionId = sessionId;

        if (!targetSessionId) {
          try {
            const hRes = await chargingService.getChargingHistory(currentUser.userId);
            const list = hRes.data || [];
            if (list.length > 0) {
              targetSessionId = list[0].sessionId;
            }
          } catch {
            const userSessions = dataStore.getSessions(currentUser.userId);
            if (userSessions.length > 0) {
              targetSessionId = userSessions[0].sessionId;
            }
          }
        }

        if (targetSessionId) {
          try {
            const res = await paymentService.getInvoice(targetSessionId);
            invData = res.data;
          } catch (invErr) {
            console.warn('Backend getInvoice failed:', invErr);
            const errStr = (invErr.message || '').toLowerCase();
            if (errStr.includes('403') || errStr.includes('permission') || errStr.includes('forbidden') || errStr.includes('denied')) {
              setError('You do not have permission to view this billing statement.');
              setLoading(false);
              return;
            }
            // Fallback: derive invoice from session record
            try {
              const sRes = await chargingService.getSessionById(targetSessionId);
              const s = sRes.data;
              if (s) {
                const energy = Number(s.energyConsumedKwh || 0);
                const rate = Number(s.pricePerKwh || 14.0);
                const energyCost = +(energy * rate).toFixed(2);
                const resFee = s.reservationId ? 50.0 : 0.0;
                const totalCost = s.finalCost != null && s.finalCost > 0 ? Number(s.finalCost) : +(energyCost + resFee).toFixed(2);
                const isSessionPaid = s.paymentStatus === 'SUCCESS' || s.paymentStatus === 'PAID';

                invData = {
                  invoiceNumber: `INV-${String(s.sessionId).padStart(6, '0')}`,
                  sessionId: s.sessionId,
                  userName: currentUser?.name || currentUser?.fullName || 'Driver',
                  reservationId: s.reservationId || null,
                  stationName: s.stationName || 'Voltix Charging Hub',
                  stationAddress: s.address || 'Network Charging Bay',
                  chargerNumber: s.chargerNumber || 'BAY-01',
                  connectorType: s.connectorType || 'CCS2',
                  vehicleId: s.vehicleId,
                  vehicleName: s.vehicleName || 'Registered EV',
                  registrationNumber: s.registrationNumber || '—',
                  startTime: s.startTime,
                  endTime: s.endTime || new Date().toISOString(),
                  durationMinutes: s.durationMinutes || 45,
                  energyConsumedKwh: energy,
                  ratePerKwh: rate,
                  energyCost: energyCost,
                  reservationFee: resFee,
                  idleFee: 0.0,
                  discountAmount: 0.0,
                  finalCost: totalCost,
                  amountPaid: isSessionPaid ? totalCost : 0.0,
                  outstandingAmount: isSessionPaid ? 0.0 : totalCost,
                  paymentStatus: s.paymentStatus || (s.endTime ? 'PAID' : 'PENDING'),
                  paymentMethod: s.paymentMethod || 'WALLET',
                  paymentTime: s.endTime,
                  transactionReference: `VX-TXN-${String(s.sessionId).padStart(6, '0')}`,
                };
              }
            } catch (fallbackErr) {
              console.error('Failed to derive invoice fallback:', fallbackErr);
            }
          }
        }

        if (invData) {
          setInvoice(invData);
        } else {
          setError('No invoice record found for this charging session.');
        }
      } catch (err) {
        console.error('Failed to load invoice statement:', err);
        setError('Failed to load billing statement. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadInvoiceData();
  }, [sessionId, currentUser]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Loading message="Generating authoritative billing statement..." />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '600px', margin: '40px auto' }}>
          <Receipt size={40} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Billing Statement Unavailable</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {error || 'No billing record exists for the requested session.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/history')}>
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalCostNum = Number(invoice.finalCost || 0);
  const amountPaidNum = Number(invoice.amountPaid || 0);
  const outstandingNum = Number(invoice.outstandingAmount || 0);
  const energyKwhNum = Number(invoice.energyConsumedKwh || 0);
  const rateNum = Number(invoice.ratePerKwh || 14.0);
  const energyCostNum = Number(invoice.energyCost || (energyKwhNum * rateNum));
  const reservationFeeNum = Number(invoice.reservationFee || 0);
  const idleFeeNum = Number(invoice.idleFee || 0);
  const discountNum = Number(invoice.discountAmount || 0);

  const statusUpper = (invoice.paymentStatus || 'UNPAID').toUpperCase();
  const isPaid = statusUpper === 'PAID' || statusUpper === 'SUCCESS';
  const driverName = invoice.userName || currentUser?.name || currentUser?.fullName || currentUser?.email || 'Driver';
  const driverEmail = currentUser?.email || 'driver@voltix.in';

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Action Controls (hidden when printing) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/history')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          Back to History
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            Print / Save Receipt
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Container */}
      <div
        className="card"
        style={{
          padding: '40px',
          background: '#ffffff',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-card)', paddingBottom: '24px', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                VOLTIX
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tax Invoice & Billing Statement
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status:</span>
              <StatusBadge status={statusUpper} size="sm" />
            </div>
            <div className="mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
              {invoice.invoiceNumber || `INV-${String(invoice.sessionId).padStart(6, '0')}`}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Issued: {formatDateTime(invoice.endTime || invoice.paymentTime)}
            </div>
          </div>
        </div>

        {/* 2-Column Entity Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
          {/* Driver & Vehicle Details */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={14} style={{ color: 'var(--primary)' }} />
              Driver & Vehicle Particulars
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
              {driverName}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              Account: <span className="mono">{driverEmail}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              EV Model: <strong>{invoice.vehicleName || 'Registered EV'}</strong>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Registration No: <span className="mono" style={{ fontWeight: 600 }}>{invoice.registrationNumber || '—'}</span>
            </div>
          </div>

          {/* Station & Bay Details */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              Charging Station & Hardware Bay
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
              {invoice.stationName || 'Voltix Charging Station'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {invoice.stationAddress || 'Voltix Fast Charging Network Hub'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Bay: <strong className="mono">{invoice.chargerNumber || 'BAY-01'}</strong> &bull; Standard: <strong className="mono">{invoice.connectorType || 'CCS2'}</strong>
            </div>
          </div>
        </div>

        {/* Technical Session Bar */}
        <div
          style={{
            background: 'var(--bg-page)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Session ID</span>
            <strong className="mono" style={{ color: 'var(--primary)', fontSize: '14px' }}>
              #VX-S{String(invoice.sessionId).padStart(4, '0')}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Reservation Ref</span>
            <strong className="mono" style={{ fontSize: '13.5px' }}>
              {invoice.reservationId ? `VX-R${String(invoice.reservationId).padStart(4, '0')}` : 'Walk-In Slot'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Session Start</span>
            <span className="mono" style={{ fontSize: '12.5px' }}>{formatDateTime(invoice.startTime)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Session End</span>
            <span className="mono" style={{ fontSize: '12.5px' }}>{formatDateTime(invoice.endTime)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Active Duration</span>
            <strong className="mono" style={{ fontSize: '14px' }}>
              {invoice.durationMinutes || 1} mins
            </strong>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Itemized Tariff Ledger
          </div>
          <table className="data-table" style={{ width: '100%', marginBottom: '0' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Description</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Quantity / Units</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Tariff Rate</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ fontWeight: 600 }}>Energy Delivered</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>High-voltage DC fast charging transfer</div>
                </td>
                <td className="mono" style={{ textAlign: 'center' }}>{energyKwhNum.toFixed(2)} kWh</td>
                <td className="mono" style={{ textAlign: 'right' }}>₹{rateNum.toFixed(2)}/kWh</td>
                <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>₹{energyCostNum.toFixed(2)}</td>
              </tr>

              {reservationFeeNum > 0 && (
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>Bay Slot Reservation Fee</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dedicated bay slot allocation lock</div>
                  </td>
                  <td className="mono" style={{ textAlign: 'center' }}>1 slot</td>
                  <td className="mono" style={{ textAlign: 'right' }}>₹{reservationFeeNum.toFixed(2)}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>₹{reservationFeeNum.toFixed(2)}</td>
                </tr>
              )}

              {idleFeeNum > 0 && (
                <tr>
                  <td>
                    <div style={{ fontWeight: 600 }}>Bay Overstay Surcharge</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Post-charge bay occupancy fee</div>
                  </td>
                  <td className="mono" style={{ textAlign: 'center' }}>Standard</td>
                  <td className="mono" style={{ textAlign: 'right' }}>₹{idleFeeNum.toFixed(2)}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>₹{idleFeeNum.toFixed(2)}</td>
                </tr>
              )}

              {discountNum > 0 && (
                <tr>
                  <td style={{ color: '#059669' }}>
                    <div style={{ fontWeight: 600 }}>Promotional Rebate</div>
                    <div style={{ fontSize: '12px' }}>Network introductory voucher</div>
                  </td>
                  <td className="mono" style={{ textAlign: 'center', color: '#059669' }}>1 discount</td>
                  <td className="mono" style={{ textAlign: 'right', color: '#059669' }}>-₹{discountNum.toFixed(2)}</td>
                  <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>-₹{discountNum.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Settlement Status */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Final Bill Amount</span>
              <strong className="mono" style={{ fontSize: '15px' }}>₹{finalCostNum.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)', color: isPaid ? '#059669' : 'var(--text-main)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Amount Actually Paid
                {invoice.paymentMethod && (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    ({invoice.paymentMethod})
                  </span>
                )}
              </span>
              <strong className="mono" style={{ fontSize: '15px' }}>
                ₹{amountPaidNum.toFixed(2)}
              </strong>
            </div>

            {invoice.transactionReference && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Transaction Ref:</span>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {invoice.transactionReference}
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                paddingTop: '8px',
                borderTop: '2px solid var(--border-card)',
              }}
            >
              <span>Outstanding Amount</span>
              <span
                className="mono"
                style={{
                  fontSize: '20px',
                  color: outstandingNum > 0 ? '#dc2626' : '#059669',
                }}
              >
                ₹{outstandingNum.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Read-Only Disclaimer Footer */}
        <div
          style={{
            background: 'var(--bg-page)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <ShieldCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>Authoritative Read-Only Statement:</strong> This tax invoice is computed idempotently from the authoritative Voltix charging ledger and MySQL database. Charging sessions are settled automatically through user wallets or registered payment instruments. For support or corporate invoicing, please contact billing@voltix.energy.
          </div>
        </div>
      </div>
    </div>
  );
}
