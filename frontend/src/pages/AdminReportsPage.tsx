
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileWarning,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

import { getAccount, getToken } from '../auth';

type MonthlyCollection = {
  month: string;
  paymentCount: number;
  totalCollected: number | string;
};

type OutstandingInvoice = {
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  status: string;
  dueDate: string;
  totalAmount: number | string;
  amountPaid: number | string;
  balanceDue: number | string;
};

type PaymentMethod = {
  paymentMethod: string;
  paymentCount: number;
  totalCollected: number | string;
};

const money = (value: number | string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number);

  if (!year || !month) return value;

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

function formatDate(value: string) {
  if (!value) return '—';

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 22,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 12px',
  color: '#64748b',
  fontWeight: 600,
  fontSize: 12,
  borderBottom: '1px solid #e2e8f0',
};

const tdStyle: React.CSSProperties = {
  padding: '15px 12px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: 13,
  color: '#334155',
};

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const account = getAccount();

  const [monthly, setMonthly] = useState<MonthlyCollection[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingInvoice[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [monthlyResult, outstandingResult, methodsResult] =
        await Promise.all([
          axios.get<MonthlyCollection[]>(
            '/api/reports/monthly-collections',
            { headers }
          ),
          axios.get<OutstandingInvoice[]>(
            '/api/reports/outstanding-invoices',
            { headers }
          ),
          axios.get<PaymentMethod[]>(
            '/api/reports/payment-methods',
            { headers }
          ),
        ]);

      setMonthly(monthlyResult.data);
      setOutstanding(outstandingResult.data);
      setMethods(methodsResult.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        if (err.response?.status === 403) {
          setError('You do not have permission to view these reports.');
        } else {
          setError(
            'Unable to load financial reports. Check that the backend is running.'
          );
        }
      } else {
        setError('An unexpected error occurred while loading reports.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const collectedAmount = methods.reduce(
    (sum, item) => sum + Number(item.totalCollected || 0),
    0
  );

  const outstandingAmount = outstanding.reduce(
    (sum, item) => sum + Number(item.balanceDue || 0),
    0
  );

  const totalPayments = methods.reduce(
    (sum, item) => sum + Number(item.paymentCount || 0),
    0
  );

  const maxCollection = Math.max(
    1,
    ...monthly.map((item) => Number(item.totalCollected || 0))
  );

  const totalMethodCollections = collectedAmount;

  const summaryCards = [
    {
      label: 'Total Collected',
      value: money(collectedAmount),
      icon: IndianRupee,
    },
    {
      label: 'Outstanding Balance',
      value: money(outstandingAmount),
      icon: FileWarning,
    },
    {
      label: 'Payments Recorded',
      value: String(totalPayments),
      icon: CreditCard,
    },
    {
      label: 'Outstanding Invoices',
      value: String(outstanding.length),
      icon: CalendarDays,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        padding: '28px clamp(16px, 4vw, 48px)',
      }}
    >
      <div style={{ maxWidth: 1250, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 30,
          }}
        >
          <div>
            <p
              style={{
                color: '#64748b',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.3,
                marginBottom: 10,
              }}
            >
              ADMIN / FINANCIAL REPORTS
            </p>

            <h1
              style={{
                fontSize: 'clamp(26px, 4vw, 36px)',
                margin: 0,
                letterSpacing: '-1px',
              }}
            >
              Financial Reports
            </h1>

            <p style={{ color: '#64748b', marginTop: 10 }}>
              Review collections, payment methods, and unpaid invoices.
            </p>

            <p style={{ color: '#94a3b8', fontSize: 12 }}>
              Signed in as {account?.name || 'Administrator'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              style={{
                padding: '11px 15px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => void loadReports()}
              disabled={loading}
              style={{
                padding: '11px 15px',
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                borderRadius: 10,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              padding: 16,
              marginBottom: 20,
              border: '1px solid #fecaca',
              borderRadius: 12,
              background: '#fef2f2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {loading && (
          <p style={{ color: '#64748b' }}>
            Loading financial reports...
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.label} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontSize: 13 }}
                  >
                    {card.label}
                  </span>
                  <Icon size={20} color="#64748b" />
                </div>

                <h2
                  style={{
                    fontSize: 25,
                    margin: '18px 0 0',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {loading ? '—' : card.value}
                </h2>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 20,
            marginBottom: 24,
          }}
        >
          <section style={cardStyle}>
            <h2
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                fontSize: 19,
                marginTop: 0,
              }}
            >
              <TrendingUp size={21} />
              Monthly Collections
            </h2>

            <p style={{ color: '#64748b', fontSize: 13 }}>
              Amount collected each month
            </p>

            {!loading && !error && monthly.length === 0 && (
              <p style={{ color: '#94a3b8' }}>
                No payment collections recorded yet.
              </p>
            )}

            <div style={{ display: 'grid', gap: 19, marginTop: 25 }}>
              {monthly.map((item) => {
                const amount = Number(item.totalCollected || 0);

                return (
                  <div key={item.month}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 9,
                        fontSize: 13,
                      }}
                    >
                      <strong>{formatMonth(item.month)}</strong>
                      <span>{money(amount)}</span>
                    </div>

                    <div
                      style={{
                        height: 12,
                        borderRadius: 10,
                        background: '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(amount / maxCollection) * 100}%`,
                          background: '#2563eb',
                          borderRadius: 10,
                        }}
                      />
                    </div>

                    <p
                      style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        marginBottom: 0,
                      }}
                    >
                      {item.paymentCount} payment(s)
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={cardStyle}>
            <h2
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                fontSize: 19,
                marginTop: 0,
              }}
            >
              <CreditCard size={21} />
              Payment Methods
            </h2>

            <p style={{ color: '#64748b', fontSize: 13 }}>
              Collection breakdown by payment method
            </p>

            {!loading && !error && methods.length === 0 && (
              <p style={{ color: '#94a3b8' }}>
                No payment method data available.
              </p>
            )}

            <div style={{ display: 'grid', gap: 22, marginTop: 25 }}>
              {methods.map((item) => {
                const amount = Number(item.totalCollected || 0);
                const percent =
                  totalMethodCollections > 0
                    ? (amount / totalMethodCollections) * 100
                    : 0;

                return (
                  <div key={item.paymentMethod}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <strong style={{ fontSize: 13 }}>
                        {item.paymentMethod}
                      </strong>

                      <span style={{ fontSize: 13 }}>
                        {money(amount)}
                      </span>
                    </div>

                    <div
                      style={{
                        height: 12,
                        borderRadius: 10,
                        background: '#e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: '#0d9488',
                          borderRadius: 10,
                        }}
                      />
                    </div>

                    <p
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        marginBottom: 0,
                      }}
                    >
                      {item.paymentCount} payment(s) ·{' '}
                      {percent.toFixed(1)}% of collections
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section style={cardStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: 19, margin: 0 }}>
                Outstanding Invoices
              </h2>

              <p style={{ color: '#64748b', fontSize: 13 }}>
                Issued invoices with remaining balances
              </p>
            </div>

            <span style={{ color: '#64748b', fontSize: 13 }}>
              {outstanding.length} invoice(s)
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 14 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 750,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Invoice</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Total Amount</th>
                  <th style={thStyle}>Balance Due</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  !error &&
                  outstanding.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          ...tdStyle,
                          textAlign: 'center',
                          padding: 35,
                          color: '#64748b',
                        }}
                      >
                        No outstanding invoices found.
                      </td>
                    </tr>
                  )}

                {outstanding.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td style={tdStyle}>
                      <strong>{invoice.invoiceNumber}</strong>
                    </td>

                    <td style={tdStyle}>
                      {invoice.customerName}
                    </td>

                    <td style={tdStyle}>
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td style={tdStyle}>
                      {invoice.status}
                    </td>

                    <td style={tdStyle}>
                      {money(invoice.totalAmount)}
                    </td>

                    <td style={tdStyle}>
                      <strong>{money(invoice.balanceDue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          Brightloop · Financial Reporting · Data from PostgreSQL
        </p>
      </div>
    </div>
  );
}
