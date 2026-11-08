
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type OverdueInvoice = {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  status: string;
  dueDate: string | null;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

type OverdueSummary = {
  overdueInvoiceCount: number;
  totalOverdueAmount: number;
};

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value.slice(0, 10) + 'T00:00:00');

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysOverdue(dueDate: string | null) {
  if (!dueDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate.slice(0, 10) + 'T00:00:00');

  if (Number.isNaN(due.getTime())) return 0;

  return Math.max(
    0,
    Math.floor((today.getTime() - due.getTime()) / 86400000)
  );
}

export default function StaffOverduePage() {
  const navigate = useNavigate();
  const account = getAccount();

  const [invoices, setInvoices] = useState<OverdueInvoice[]>([]);
  const [summary, setSummary] = useState<OverdueSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [navigate]);

  const loadOverdueData = useCallback(async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [invoiceResponse, summaryResponse] = await Promise.all([
        axios.get<OverdueInvoice[]>(
          '/api/overdue/invoices',
          { headers }
        ),
        axios.get<OverdueSummary>(
          '/api/overdue/summary',
          { headers }
        ),
      ]);

      setInvoices(invoiceResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      setError(
        'Unable to load overdue invoices. Check the backend connection and staff permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadOverdueData();
  }, [loadOverdueData]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter(invoice =>
      (invoice.invoiceNumber ?? '').toLowerCase().includes(query) ||
      (invoice.customerName ?? '').toLowerCase().includes(query) ||
      String(invoice.id).includes(query)
    );
  }, [invoices, search]);

  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amountPaid || 0),
    0
  );

  const totalOutstanding = Number(
    summary?.totalOverdueAmount ?? 0
  );

  async function refreshOverdueStatuses() {
    if (refreshing) return;

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setRefreshing(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post<{
        updatedInvoices: number;
      }>(
        '/api/overdue/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadOverdueData();

      setSuccess(
        `Overdue status refresh completed. ` +
        `${response.data.updatedInvoices} invoice(s) updated.`
      );
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      setError(
        'Unable to refresh overdue statuses. Check your permissions and backend.'
      );
    } finally {
      setRefreshing(false);
    }
  }

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="admin-layout">
      {menuOpen && (
        <button
          className="admin-backdrop"
          type="button"
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
            type="button"
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
          <button
            className="admin-nav-link"
            type="button"
            onClick={() => navigate('/staff/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className="admin-nav-link"
            type="button"
            onClick={() => navigate('/staff/invoices')}
          >
            <FileText size={18} />
            <span>Invoices</span>
          </button>

          <button
            className="admin-nav-link active"
            type="button"
          >
            <AlertCircle size={18} />
            <span>Overdue invoices</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Staff workspace</span>
          </div>

          <button
            className="admin-logout"
            type="button"
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
              type="button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <span>Staff Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Overdue Invoices</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              Staff Portal
            </span>

            <div className="admin-avatar">
              {account?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </header>

        <main className="admin-page-body">
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                STAFF / BILLING / OVERDUE
              </span>

              <h1>
                Overdue <span>invoices.</span>
              </h1>

              <p>
                Monitor unpaid balances and overdue customer invoices.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              <button
                type="button"
                className="admin-refresh"
                disabled={loading || refreshing}
                onClick={() => void loadOverdueData()}
              >
                <RefreshCw size={16} />
                Refresh data
              </button>

              <button
                type="button"
                className="admin-refresh"
                disabled={loading || refreshing}
                onClick={() => void refreshOverdueStatuses()}
              >
                <CalendarClock size={16} />
                {refreshing
                  ? 'Updating...'
                  : 'Refresh overdue statuses'}
              </button>
            </div>
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
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 14,
                marginBottom: 20,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                color: '#047857',
              }}
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Overdue invoices</span>
                <AlertCircle size={19} />
              </div>

              <strong>
                {loading ? '—' : summary?.overdueInvoiceCount ?? 0}
              </strong>

              <small>Invoices marked overdue</small>
            </div>

            <div className="admin-metric-card metric-purple">
              <div className="admin-metric-header">
                <span>Total overdue amount</span>
                <Wallet size={19} />
              </div>

              <strong>
                {loading ? '—' : currency(totalOutstanding)}
              </strong>

              <small>Outstanding overdue balance</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Already collected</span>
                <CreditCard size={19} />
              </div>

              <strong>
                {loading ? '—' : currency(totalPaid)}
              </strong>

              <small>Payments on currently overdue invoices</small>
            </div>
          </section>

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Overdue invoice records</h2>
                <p>View customers with outstanding overdue payments.</p>
              </div>

              <FileText size={20} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                border: '1px solid #dce2e9',
                borderRadius: 10,
                marginBottom: 24,
                background: '#fff',
              }}
            >
              <Search size={18} color="#64748b" />

              <input
                type="search"
                aria-label="Search overdue invoices"
                placeholder="Search invoice number or customer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  font: 'inherit',
                }}
              />
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading overdue invoices...
              </p>
            ) : filteredInvoices.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: 'center',
                }}
              >
                <CheckCircle2
                  size={36}
                  color="#16a34a"
                  style={{ marginBottom: 12 }}
                />

                <p className="staff-empty">
                  {search
                    ? 'No matching overdue invoices found.'
                    : 'No overdue invoices found.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="customer-invoice-table"
                  style={{
                    width: '100%',
                    minWidth: 960,
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Due date</th>
                      <th>Days overdue</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Outstanding</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>{invoice.invoiceNumber}</strong>
                          <div style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            marginTop: 4,
                          }}>
                            ID #{invoice.id}
                          </div>
                        </td>

                        <td>{invoice.customerName}</td>

                        <td>{formatDate(invoice.dueDate)}</td>

                        <td>
                          <strong>
                            {daysOverdue(invoice.dueDate)} days
                          </strong>
                        </td>

                        <td>
                          <span className="customer-status-badge">
                            {invoice.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td>{currency(invoice.totalAmount)}</td>

                        <td>
                          <strong>
                            {currency(invoice.balanceDue)}
                          </strong>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-refresh"
                            onClick={() =>
                              navigate('/staff/payments/record')
                            }
                          >
                            <CreditCard size={15} />
                            Record payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <p style={{
                color: '#64748b',
                fontSize: 13,
                marginTop: 20,
              }}>
                Showing {filteredInvoices.length} of{' '}
                {invoices.length} overdue invoices
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={() => navigate('/staff/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 24,
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div className="admin-bottom-note">
            Overdue records are retrieved from your Brightloop Spring Boot API.
          </div>
        </main>
      </div>
    </div>
  );
}
