
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type FinancialSummary = {
  totalInvoiced: number;
  paymentsCollected: number;
  outstandingBalance: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  asOfDate: string;
};

type OutstandingInvoice = {
  invoiceId: number;
  invoiceNumber: string;
  customerName: string;
  status: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

const menu = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Customers', icon: Users },
  { label: 'Subscriptions', icon: Repeat2 },
  { label: 'Invoices', icon: FileText },
  { label: 'Payments', icon: CreditCard },
  { label: 'Overdue invoices', icon: AlertCircle },
];

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const account = getAccount();

  const [summary, setSummary] =
    useState<FinancialSummary | null>(null);

  const [invoices, setInvoices] =
    useState<OutstandingInvoice[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [summaryResponse, invoicesResponse] =
        await Promise.all([
          axios.get<FinancialSummary>(
            '/api/dashboard/financial',
            { headers }
          ),
          axios.get<OutstandingInvoice[]>(
            '/api/reports/outstanding-invoices',
            { headers }
          ),
        ]);

      setSummary(summaryResponse.data);
      setInvoices(invoicesResponse.data);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError(
        'Unable to load staff dashboard data. Check the backend connection and permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  const metrics = [
    {
      label: 'Total Invoiced',
      value: summary?.totalInvoiced ?? 0,
      icon: FileText,
      className: 'metric-blue',
      note: 'Issued invoice value',
    },
    {
      label: 'Payments Collected',
      value: summary?.paymentsCollected ?? 0,
      icon: Wallet,
      className: 'metric-green',
      note: 'Recorded collections',
    },
    {
      label: 'Outstanding Balance',
      value: summary?.outstandingBalance ?? 0,
      icon: CreditCard,
      className: 'metric-purple',
      note: 'Amount to collect',
    },
    {
      label: 'Overdue Amount',
      value: summary?.overdueAmount ?? 0,
      icon: AlertCircle,
      className: 'metric-orange',
      note: 'Past-due balances',
    },
  ];

  return (
    <div className="admin-layout">
      {menuOpen && (
        <button
          className="admin-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${menuOpen ? 'open' : ''}`}
      >
        <div className="admin-sidebar-top">
          <Link to="/">
            <Brand />
          </Link>

          <button
            className="admin-mobile-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          STAFF WORKSPACE
        </div>

        <nav className="admin-navigation">
          {menu.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`admin-nav-link ${
                index === 0 ? 'active' : ''
              }`}
              onClick={() => {
                setMenuOpen(false);

                if (item.label === 'Customers') {
                  navigate('/staff/customers');
                }

                if (item.label === 'Subscriptions') {
                  navigate('/staff/subscriptions');
                }

                if (item.label === 'Invoices') {
                  navigate('/staff/invoices');
                }

                if (item.label === 'Payments') {
                  navigate('/staff/payments/record');
                }

                if (item.label === 'Overdue invoices') {
                  navigate('/staff/overdue');
                }
              }}
              title={
                index === 0
                  ? 'Dashboard overview'
                  : item.label === 'Invoices'
                  ? 'Manage customer invoices'
                  : `${item.label} page coming next`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>

              {index !== 0 &&
                ![
                  'Customers',
                  'Subscriptions',
                  'Invoices',
                  'Payments',
                  'Overdue invoices',
                ].includes(item.label) && (
                  <span className="admin-nav-soon">
                    Soon
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Staff workspace</span>
          </div>

          <button
            className="admin-logout"
            onClick={signOut}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <span>Staff Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Overview</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              Staff Portal
            </span>

            <Bell size={19} />

            <div className="admin-avatar">
              {account?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        <main className="admin-page-body">
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                STAFF / OVERVIEW
              </span>

              <h1>
                Welcome back,{' '}
                <span>
                  {account?.name?.split(' ')[0] || 'Staff'}.
                </span>
              </h1>

              <p>
                Here's what's happening with billing and
                subscriptions today.
              </p>
            </div>

            <button
              className="admin-refresh"
              onClick={() => void loadDashboard()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh data
            </button>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <section className="admin-metric-grid">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className={`admin-metric-card ${metric.className}`}
              >
                <div className="admin-metric-header">
                  <span>{metric.label}</span>
                  <metric.icon size={19} />
                </div>

                <strong>
                  {loading ? '—' : currency(metric.value)}
                </strong>

                <small>{metric.note}</small>
              </div>
            ))}
          </section>

          <div className="admin-details-grid">
            <section className="admin-data-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Outstanding invoices</h2>
                  <p>
                    Invoices waiting for payment
                  </p>
                </div>

                <FileText size={20} />
              </div>

              <div className="staff-invoice-list">
                {loading ? (
                  <p className="staff-empty">
                    Loading invoices...
                  </p>
                ) : invoices.length === 0 ? (
                  <p className="staff-empty">
                    No outstanding invoices found.
                  </p>
                ) : (
                  invoices.slice(0, 5).map((invoice) => (
                    <div
                      className="staff-invoice-item"
                      key={invoice.invoiceId}
                    >
                      <div>
                        <strong>{invoice.customerName}</strong>
                        <span>
                          {invoice.invoiceNumber}
                          {' · Due '}
                          {invoice.dueDate}
                        </span>
                      </div>

                      <div className="staff-invoice-right">
                        <strong>
                          {currency(invoice.balanceDue)}
                        </strong>
                        <small>{invoice.status}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="admin-data-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Billing summary</h2>
                  <p>Current invoice status</p>
                </div>

                <ArrowUpRight size={20} />
              </div>

              <div className="admin-invoice-count">
                {loading ? '—' : summary?.totalInvoices ?? 0}
                <span> invoices</span>
              </div>

              <div className="admin-status-line">
                <span>Paid invoices</span>
                <strong>{summary?.paidInvoices ?? 0}</strong>
              </div>

              <div className="admin-status-line">
                <span>Overdue invoices</span>
                <strong>{summary?.overdueInvoices ?? 0}</strong>
              </div>

              <div className="admin-status-line">
                <span>Outstanding invoices</span>
                <strong>{loading ? '—' : invoices.length}</strong>
              </div>

              <div className="admin-status-line">
                <span>Reporting date</span>
                <strong>{summary?.asOfDate ?? '—'}</strong>
              </div>
            </section>
          </div>

          <div className="admin-bottom-note">
            Data is retrieved from your Brightloop Spring Boot APIs.
          </div>
        </main>
      </div>
    </div>
  );
}
