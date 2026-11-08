
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowUpRight,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  ChartNoAxesCombined,
  AlertCircle,
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

const menu = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Staff Management', icon: UserCog },
  { label: 'Customers', icon: Users },
  { label: 'Products', icon: Package },
  { label: 'Subscriptions', icon: Repeat2 },
  { label: 'Subscription Plans', icon: Repeat2 },
  { label: 'Invoices', icon: FileText },
  { label: 'Payments', icon: CreditCard },
  { label: 'Reports', icon: ChartNoAxesCombined },
];

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const account = getAccount();

  const [summary, setSummary] =
    useState<FinancialSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get<FinancialSummary>(
        '/api/dashboard/financial',
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setSummary(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) &&
          err.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError('Could not load financial data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

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
      note: 'Recorded payments',
    },
    {
      label: 'Outstanding Balance',
      value: summary?.outstandingBalance ?? 0,
      icon: CreditCard,
      className: 'metric-purple',
      note: 'Pending collections',
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

      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-top">
          <Link to="/">
            <Brand />
          </Link>
          <button
            className="admin-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          WORKSPACE
        </div>

        <nav className="admin-navigation">
          {menu.map((item, index) => (
            <button
              key={item.label}
              className={`admin-nav-link ${
                index === 0 ? 'active' : ''
              }`}
              onClick={() => {
                setMenuOpen(false);

                if (item.label === 'Staff Management') {
                  navigate('/admin/staff');
                }

                if (item.label === 'Customers') {
                  navigate('/admin/customers');
                }

                if (item.label === 'Products') {
                  navigate('/admin/products');
                }

                if (item.label === 'Subscriptions') {
                  navigate('/admin/subscriptions');
                }

                if (item.label === 'Subscription Plans') {
                  navigate('/admin/plans');
                }

                if (item.label === 'Invoices') {
                  navigate('/admin/invoices');
                }

                if (item.label === 'Payments') {
                  navigate('/admin/payments/record');
                }

                if (item.label === 'Reports') {
                  navigate('/admin/reports');
                }
              }}
              type="button"
              title={
                index === 0
                  ? 'Dashboard overview'
                  : `${item.label} page coming next`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {index !== 0 &&
                ![
                  'Staff Management',
                  'Customers',
                  'Products',
                  'Subscriptions',
                  'Subscription Plans',
                  'Invoices',
                  'Payments',
                  'Reports',
                ].includes(item.label) && (
                  <span className="admin-nav-soon">Soon</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Administrator workspace</span>
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
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Overview</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              Admin Portal
            </span>
            <Bell size={19} />
            <div className="admin-avatar">
              {account?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="admin-page-body">
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                DASHBOARD / OVERVIEW
              </span>
              <h1>
                Good to see you,{' '}
                <span>{account?.name?.split(' ')[0] || 'Admin'}.</span>
              </h1>
              <p>
                Here's a clear view of your Brightloop workspace.
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
                  <h2>Collection overview</h2>
                  <p>
                    How much of your invoiced amount has been paid?
                  </p>
                </div>
                <ArrowUpRight size={20} />
              </div>

              <div className="admin-collection-amount">
                {loading
                  ? '—'
                  : currency(summary?.paymentsCollected ?? 0)}
                <span> collected</span>
              </div>

              <div className="admin-progress-track">
                <div
                  className="admin-progress-fill"
                  style={{
                    width: summary?.totalInvoiced
                      ? `${
                          Math.min(
                            100,
                            (summary.paymentsCollected /
                              summary.totalInvoiced) * 100
                          )
                        }%`
                      : '0%',
                  }}
                />
              </div>

              <div className="admin-progress-labels">
                <span>Collected</span>
                <span>
                  {loading
                    ? '—'
                    : currency(summary?.outstandingBalance ?? 0)}
                  {' '}outstanding
                </span>
              </div>
            </section>

            <section className="admin-data-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Invoice status</h2>
                  <p>Current billing snapshot</p>
                </div>
                <FileText size={20} />
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
                <span>Reporting date</span>
                <strong>{summary?.asOfDate || '—'}</strong>
              </div>
            </section>
          </div>

          <div className="admin-bottom-note">
            Financial figures are retrieved from your Brightloop backend.
          </div>
        </main>
      </div>
    </div>
  );
}
