
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Repeat2,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type Subscription = {
  id: number;
  customerId: number;
  customerName: string;
  quotationId: number | null;
  planId: number;
  planName: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

type SubscriptionAction =
  | 'confirm'
  | 'activate'
  | 'pause'
  | 'resume'
  | 'close';

const actions: {
  key: SubscriptionAction;
  label: string;
}[] = [
  { key: 'confirm', label: 'Confirm' },
  { key: 'activate', label: 'Activate' },
  { key: 'pause', label: 'Pause' },
  { key: 'resume', label: 'Resume' },
  { key: 'close', label: 'Close' },
];

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

function formatStatus(value: string) {
  return value.replace(/_/g, ' ');
}

export default function StaffSubscriptionsPage() {
  const navigate = useNavigate();
  const account = getAccount();
  const isAdmin = account?.role === 'ADMIN';

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : '/staff/dashboard';

  const workspaceName = isAdmin
    ? 'Admin Workspace'
    : 'Staff Workspace';

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadSubscriptions = useCallback(async () => {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<Subscription[]>(
        '/api/subscriptions',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubscriptions(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError('Unable to load subscriptions. Check backend connection and staff permissions.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadSubscriptions();
  }, [loadSubscriptions]);

  const statusOptions = useMemo(
    () => Array.from(
      new Set(subscriptions.map(item => item.status))
    ).sort(),
    [subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter(item => {
      const matchesSearch =
        String(item.id).includes(query) ||
        item.customerName.toLowerCase().includes(query) ||
        item.planName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const selectedSubscription = subscriptions.find(
    item => item.id === selectedId
  );

  const activeCount = subscriptions.filter(
    item => item.status === 'ACTIVE'
  ).length;

  const pausedCount = subscriptions.filter(
    item => item.status === 'PAUSED'
  ).length;

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  async function updateSubscription(
    subscription: Subscription,
    action: SubscriptionAction
  ) {
    if (busyId !== null) return;

    const confirmed = window.confirm(
      `${action.toUpperCase()} subscription #${subscription.id} for ${subscription.customerName}?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setBusyId(subscription.id);
    setError('');
    setSuccess('');

    try {
      const response = await axios.patch<Subscription>(
        `/api/subscriptions/${subscription.id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubscriptions(previous =>
        previous.map(item =>
          item.id === subscription.id ? response.data : item
        )
      );

      setSuccess(
        `Subscription #${subscription.id} updated to ${formatStatus(response.data.status)}.`
      );
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      const statusCode = axios.isAxiosError(err)
        ? err.response?.status
        : undefined;

      if (statusCode === 409 || statusCode === 400) {
        setError(
          `Cannot ${action} this subscription in its current state.`
        );
      } else {
        setError(
          `Unable to ${action} subscription. Check backend permissions and server logs.`
        );
      }
    } finally {
      setBusyId(null);
    }
  }

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
            type="button"
            className="admin-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          {workspaceName.toUpperCase()}
        </div>

        <nav className="admin-navigation">
          <button
            type="button"
            className="admin-nav-link"
            onClick={() => navigate(dashboardPath)}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className="admin-nav-link active"
          >
            <Repeat2 size={18} />
            <span>Subscriptions</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>{workspaceName}</span>
          </div>

          <button
            type="button"
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
              type="button"
              className="admin-menu-toggle"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <span>{workspaceName}</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Subscriptions</strong>
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
                {isAdmin
                  ? 'ADMIN / SUBSCRIPTIONS'
                  : 'STAFF / SUBSCRIPTIONS'}
              </span>

              <h1>
                Subscription <span>management.</span>
              </h1>

              <p>
                Track subscription plans, billing dates, and lifecycle.
              </p>
            </div>

            <button
              type="button"
              className="admin-refresh"
              disabled={loading || busyId !== null}
              onClick={() => void loadSubscriptions()}
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
                color: '#047857',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
              }}
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-blue">
              <div className="admin-metric-header">
                <span>Total subscriptions</span>
                <Repeat2 size={19} />
              </div>

              <strong>{loading ? '—' : subscriptions.length}</strong>
              <small>All subscription records</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Active subscriptions</span>
                <CheckCircle2 size={19} />
              </div>

              <strong>{loading ? '—' : activeCount}</strong>
              <small>Currently active</small>
            </div>

            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Paused subscriptions</span>
                <AlertCircle size={19} />
              </div>

              <strong>{loading ? '—' : pausedCount}</strong>
              <small>Temporarily paused</small>
            </div>
          </section>

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>All subscriptions</h2>
                <p>View and manage customer subscription records.</p>
              </div>

              <Repeat2 size={20} />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: '1 1 240px',
                  padding: '11px 14px',
                  border: '1px solid #dce2e9',
                  borderRadius: 10,
                  background: '#fff',
                }}
              >
                <Search size={18} color="#64748b" />

                <input
                  type="search"
                  placeholder="Search customer, plan, or subscription ID..."
                  aria-label="Search subscriptions"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
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

              <select
                aria-label="Filter subscriptions by status"
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value)}
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid #dce2e9',
                  background: '#fff',
                  color: '#334155',
                  font: 'inherit',
                }}
              >
                <option value="ALL">All statuses</option>

                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading subscriptions...
              </p>
            ) : filteredSubscriptions.length === 0 ? (
              <p className="staff-empty">
                No matching subscriptions found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="customer-invoice-table"
                  style={{
                    width: '100%',
                    minWidth: 980,
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Subscription</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Start date</th>
                      <th>Next billing</th>
                      <th>Auto renew</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscriptions.map(subscription => (
                      <tr key={subscription.id}>
                        <td>
                          <strong>#{subscription.id}</strong>
                        </td>

                        <td>{subscription.customerName}</td>

                        <td>{subscription.planName}</td>

                        <td>
                          <span className="customer-status-badge">
                            {formatStatus(subscription.status)}
                          </span>
                        </td>

                        <td>{formatDate(subscription.startDate)}</td>

                        <td>{formatDate(subscription.nextBillingDate)}</td>

                        <td>
                          {subscription.autoRenew ? 'Yes' : 'No'}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-refresh"
                            onClick={() => {
                              setSelectedId(
                                selectedId === subscription.id
                                  ? null
                                  : subscription.id
                              );
                            }}
                          >
                            {selectedId === subscription.id
                              ? 'Hide'
                              : 'View'}
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
                marginTop: 20,
                color: '#64748b',
                fontSize: 13,
              }}>
                Showing {filteredSubscriptions.length} of{' '}
                {subscriptions.length} subscriptions
              </p>
            )}
          </section>

          {selectedSubscription && (
            <section
              className="admin-data-panel"
              style={{ marginTop: 24 }}
            >
              <div className="admin-panel-heading">
                <div>
                  <h2>
                    Subscription #{selectedSubscription.id}
                  </h2>
                  <p>
                    {selectedSubscription.customerName}
                    {' — '}
                    {selectedSubscription.planName}
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-refresh"
                  onClick={() => setSelectedId(null)}
                >
                  <X size={16} />
                  Close
                </button>
              </div>

              <div className="admin-status-line">
                <span>Subscription status</span>
                <strong>
                  {formatStatus(selectedSubscription.status)}
                </strong>
              </div>

              <div className="admin-status-line">
                <span>Customer ID</span>
                <strong>#{selectedSubscription.customerId}</strong>
              </div>

              <div className="admin-status-line">
                <span>Plan ID</span>
                <strong>#{selectedSubscription.planId}</strong>
              </div>

              <div className="admin-status-line">
                <span>Quotation ID</span>
                <strong>
                  {selectedSubscription.quotationId ?? '—'}
                </strong>
              </div>

              <div className="admin-status-line">
                <span>Start date</span>
                <strong>
                  {formatDate(selectedSubscription.startDate)}
                </strong>
              </div>

              <div className="admin-status-line">
                <span>End date</span>
                <strong>
                  {formatDate(selectedSubscription.endDate)}
                </strong>
              </div>

              <div className="admin-status-line">
                <span>Next billing date</span>
                <strong>
                  {formatDate(selectedSubscription.nextBillingDate)}
                </strong>
              </div>

              <div className="admin-status-line">
                <span>Auto renewal</span>
                <strong>
                  {selectedSubscription.autoRenew
                    ? 'Enabled'
                    : 'Disabled'}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 20,
                  marginBottom: 12,
                }}
              >
                <CalendarDays size={18} />
                <strong>Subscription actions</strong>
              </div>

              <p style={{
                color: '#64748b',
                fontSize: 13,
                marginBottom: 14,
              }}>
                Actions are validated by the backend.
                Only applicable lifecycle transitions will succeed.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                {actions.map(action => (
                  <button
                    key={action.key}
                    type="button"
                    className="admin-refresh"
                    disabled={busyId !== null}
                    onClick={() =>
                      void updateSubscription(
                        selectedSubscription,
                        action.key
                      )
                    }
                  >
                    {busyId === selectedSubscription.id
                      ? 'Updating...'
                      : action.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="admin-bottom-note">
            Subscription data is retrieved from your Brightloop Spring Boot APIs.
          </div>
        </main>
      </div>
    </div>
  );
}
