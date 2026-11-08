
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Wallet,
} from 'lucide-react';

import { getAccount, getToken, logout } from '../auth';

type Invoice = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

type PaymentResponse = {
  id: number;
  invoiceId: number;
  invoiceStatus: string;
  invoiceBalanceDue: number;
};

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
];

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function todayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #dbe2ea',
  background: '#fff',
  color: '#334155',
  font: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 8,
  color: '#475569',
};

export default function StaffRecordPaymentPage() {
  const navigate = useNavigate();
  const account = getAccount();

  const isAdmin = account?.role === 'ADMIN';

  const invoicePath = isAdmin
    ? '/admin/invoices'
    : '/staff/invoices';

  const workspaceName = isAdmin
    ? 'Admin'
    : 'Staff';

  const submittingRef = useRef(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayLocal());
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completed, setCompleted] = useState(false);

  const loadInvoices = useCallback(async () => {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<Invoice[]>('/api/invoices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvoices(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError('Unable to load invoices from the backend.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const unpaidInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          !['DRAFT', 'CANCELLED', 'PAID'].includes(invoice.status) &&
          Number(invoice.balanceDue) > 0
      ),
    [invoices]
  );

  const selectedInvoice = invoices.find(
    (invoice) => String(invoice.id) === invoiceId
  );

  const balanceDue = Number(selectedInvoice?.balanceDue ?? 0);

  function resetResult() {
    setError('');
    setSuccess('');
    setCompleted(false);
  }

  async function recordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current || completed) return;

    resetResult();

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    if (!selectedInvoice) {
      setError('Please select an unpaid invoice.');
      return;
    }

    const paymentAmount = Number(amount);

    if (
      !/^\d+(\.\d{1,2})?$/.test(amount.trim()) ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0 ||
      paymentAmount > balanceDue
    ) {
      setError('Enter a valid amount within the outstanding balance.');
      return;
    }

    if (!paymentDate || paymentDate > todayLocal()) {
      setError('Payment date cannot be in the future.');
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const response = await axios.post<PaymentResponse>(
        '/api/payments',
        {
          invoiceId: selectedInvoice.id,
          amount: paymentAmount,
          paymentMethod,
          referenceNumber: referenceNumber.trim() || null,
          paymentDate,
          notes: notes.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const recorded = response.data;

      setSuccess(
        `Payment #${recorded.id} recorded successfully. ` +
        `Invoice status: ${recorded.invoiceStatus}. ` +
        `Remaining balance: ${currency(Number(recorded.invoiceBalanceDue))}.`
      );

      setCompleted(true);

      // Refresh balances after the successful transaction.
      try {
        const refreshed = await axios.get<Invoice[]>(
          '/api/invoices',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInvoices(refreshed.data);
      } catch {
        // Payment succeeded even if refreshing the list fails.
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError(
        'The payment could not be confirmed. Check invoice payment history ' +
        'before submitting again to avoid a duplicate.'
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-layout">
      <div className="admin-content" style={{ margin: '0 auto', width: '100%' }}>
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-refresh"
              onClick={() => navigate(invoicePath)}
            >
              <ArrowLeft size={17} />
              Back to invoices
            </button>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              <span aria-label={`${workspaceName} Portal`}>
                {isAdmin ? 'Admin Portal' : 'Staff Portal'}
              </span>
            </span>
          </div>
        </header>

        <main className="admin-page-body" style={{ maxWidth: 850, margin: '0 auto' }}>
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                {isAdmin ? 'ADMIN / PAYMENTS' : 'STAFF / PAYMENTS'}
              </span>

              <h1>
                Record <span>payment.</span>
              </h1>

              <p>Record an offline payment against a customer invoice.</p>
            </div>

            <button
              className="admin-refresh"
              type="button"
              disabled={loading || submitting}
              onClick={() => void loadInvoices()}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                padding: 16,
                marginBottom: 20,
                borderRadius: 12,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                display: 'flex',
                gap: 10,
              }}
            >
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Payment details</h2>
                <p>All fields marked * are required.</p>
              </div>

              <CreditCard size={20} />
            </div>

            <form onSubmit={(event) => void recordPayment(event)}>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="payment-invoice" style={labelStyle}>
                  Select invoice *
                </label>

                <select
                  id="payment-invoice"
                  style={fieldStyle}
                  value={invoiceId}
                  disabled={loading || submitting || completed}
                  required
                  onChange={(event) => {
                    setInvoiceId(event.target.value);
                    setAmount('');
                    resetResult();
                  }}
                >
                  <option value="">
                    {loading ? 'Loading invoices...' : 'Choose an unpaid invoice'}
                  </option>

                  {unpaidInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} — {invoice.customerName}
                      {' — '}
                      {currency(Number(invoice.balanceDue))}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 24,
                  }}
                >
                  <div className="admin-panel-heading">
                    <div>
                      <h2>{selectedInvoice.invoiceNumber}</h2>
                      <p>{selectedInvoice.customerName}</p>
                    </div>
                    <Wallet size={20} />
                  </div>

                  <div className="admin-status-line">
                    <span>Invoice total</span>
                    <strong>
                      {currency(Number(selectedInvoice.totalAmount))}
                    </strong>
                  </div>

                  <div className="admin-status-line">
                    <span>Already paid</span>
                    <strong>
                      {currency(Number(selectedInvoice.amountPaid))}
                    </strong>
                  </div>

                  <div className="admin-status-line">
                    <span>Outstanding balance</span>
                    <strong>{currency(balanceDue)}</strong>
                  </div>

                  <div className="admin-status-line">
                    <span>Status</span>
                    <strong>{selectedInvoice.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 18,
                }}
              >
                <div>
                  <label htmlFor="payment-amount" style={labelStyle}>
                    Amount received (₹) *
                  </label>

                  <input
                    id="payment-amount"
                    style={fieldStyle}
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selectedInvoice ? balanceDue : undefined}
                    required
                    placeholder="Enter amount"
                    value={amount}
                    disabled={!selectedInvoice || submitting || completed}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      resetResult();
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="payment-method" style={labelStyle}>
                    Payment method *
                  </label>

                  <select
                    id="payment-method"
                    style={fieldStyle}
                    value={paymentMethod}
                    disabled={submitting || completed}
                    onChange={(event) => {
                      setPaymentMethod(event.target.value);
                      resetResult();
                    }}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="payment-date" style={labelStyle}>
                    Payment date *
                  </label>

                  <input
                    id="payment-date"
                    type="date"
                    style={fieldStyle}
                    value={paymentDate}
                    max={todayLocal()}
                    required
                    disabled={submitting || completed}
                    onChange={(event) => {
                      setPaymentDate(event.target.value);
                      resetResult();
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="payment-reference" style={labelStyle}>
                    Reference number
                  </label>

                  <input
                    id="payment-reference"
                    style={fieldStyle}
                    placeholder="Optional transaction reference"
                    maxLength={100}
                    value={referenceNumber}
                    disabled={submitting || completed}
                    onChange={(event) => {
                      setReferenceNumber(event.target.value);
                      resetResult();
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label htmlFor="payment-notes" style={labelStyle}>
                  Notes
                </label>

                <textarea
                  id="payment-notes"
                  style={{ ...fieldStyle, minHeight: 100, resize: 'vertical' }}
                  placeholder="Optional payment notes"
                  value={notes}
                  disabled={submitting || completed}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    resetResult();
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 28,
                }}
              >
                <button
                  type="submit"
                  className="customer-pay-btn"
                  disabled={
                    loading ||
                    submitting ||
                    completed ||
                    !selectedInvoice
                  }
                >
                  <CheckCircle2 size={18} />
                  {submitting ? 'Recording...' : 'Record payment'}
                </button>

                <button
                  type="button"
                  className="admin-refresh"
                  onClick={() => navigate(invoicePath)}
                >
                  Back to invoices
                </button>
              </div>
            </form>
          </section>

          <div className="admin-bottom-note">
            Offline payments are saved through the Brightloop Spring Boot API.
            Only record payments you have actually received.
          </div>
        </main>
      </div>
    </div>
  );
}
