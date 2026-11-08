
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Filter,
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

type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

type InvoiceResponse = {
  id: number;
  invoiceNumber: string;

  customerId: number;
  customerName: string;

  subscriptionId: number;
  status: InvoiceStatus;

  invoiceDate: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;

  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;

  createdAt: string;
  updatedAt: string;
};

const statusOptions = [
  'ALL',
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
];

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  const date = new Date(value + 'T00:00:00');

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function StaffInvoicesPage() {
  const navigate = useNavigate();
  const account = getAccount();
  const isAdmin = account?.role === 'ADMIN';

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : '/staff/dashboard';

  const paymentPath = isAdmin
    ? '/admin/payments/record'
    : '/staff/payments/record';

  const workspaceName = isAdmin
    ? 'Admin Workspace'
    : 'Staff Workspace';

  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [menuOpen, setMenuOpen] = useState(false);

  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<InvoiceResponse[]>(
        '/api/invoices',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvoices(response.data);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setError('Unable to load invoices. Check the backend connection and staff permissions.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter(invoice => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        String(invoice.id).includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalInvoiced = invoices
    .filter(invoice => !['DRAFT', 'CANCELLED'].includes(invoice.status))
    .reduce(
      (sum, invoice) => sum + Number(invoice.totalAmount || 0),
      0
    );

  const totalPaid = invoices
    .filter(invoice => !['DRAFT', 'CANCELLED'].includes(invoice.status))
    .reduce(
      (sum, invoice) => sum + Number(invoice.amountPaid || 0),
      0
    );

  const totalOutstanding = invoices
    .filter(invoice => !['DRAFT', 'CANCELLED'].includes(invoice.status))
    .reduce(
      (sum, invoice) => sum + Number(invoice.balanceDue || 0),
      0
    );

  const draftCount = invoices.filter(
    invoice => invoice.status === 'DRAFT'
  ).length;

  async function downloadInvoice(invoiceId: number) {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setDownloadingId(invoiceId);
    setError('');

    try {
      const response = await axios.get(
        `/api/invoices/${invoiceId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = URL.createObjectURL(response.data);

      const link = document.createElement('a');
      link.href = url;
      link.download = `brightloop-invoice-${invoiceId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to download this invoice.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function issueInvoice(invoice: InvoiceResponse) {
    if (invoice.status !== 'DRAFT') {
      return;
    }

    const confirmed = window.confirm(
      `Issue invoice ${invoice.invoiceNumber} for ${invoice.customerName}?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setIssuingId(invoice.id);
    setError('');
    setSuccess('');

    try {
      const response = await axios.patch<InvoiceResponse>(
        `/api/invoices/${invoice.id}/issue`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvoices(previous =>
        previous.map(item =>
          item.id === invoice.id ? response.data : item
        )
      );

      setSuccess(
        `Invoice ${invoice.invoiceNumber} issued successfully.`
      );
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
        'Unable to issue this invoice. Check its status and your permissions.'
      );
    } finally {
      setIssuingId(null);
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
            className="admin-mobile-close"
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          {workspaceName.toUpperCase()}
        </div>

        <nav className="admin-navigation">
          <button
            className="admin-nav-link"
            type="button"
            onClick={() => navigate(dashboardPath)}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className="admin-nav-link active"
            type="button"
          >
            <FileText size={18} />
            Invoices
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>{workspaceName}</span>
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
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <span>{workspaceName}</span>

            <span className="admin-breadcrumb-divider">
              /
            </span>

            <strong>Invoices</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              {isAdmin ? 'Admin Portal' : 'Staff Portal'}
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
                  ? 'ADMIN / BILLING / INVOICES'
                  : 'STAFF / BILLING / INVOICES'}
              </span>

              <h1>
                Invoice <span>management.</span>
              </h1>

              <p>
                View, search, issue, and download customer invoices.
              </p>
            </div>

            <button
              className="admin-refresh"
              type="button"
              disabled={loading}
              onClick={() => void loadInvoices()}
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
              className="admin-error"
              role="status"
              style={{
                backgroundColor: '#ecfdf5',
                color: '#047857',
                borderColor: '#a7f3d0',
              }}
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-blue">
              <div className="admin-metric-header">
                <span>Total invoiced</span>
                <FileText size={19} />
              </div>

              <strong>
                {loading ? '-' : currency(totalInvoiced)}
              </strong>

              <small>Issued invoice value</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Amount paid</span>
                <Wallet size={19} />
              </div>

              <strong>
                {loading ? '-' : currency(totalPaid)}
              </strong>

              <small>Recorded invoice payments</small>
            </div>

            <div className="admin-metric-card metric-purple">
              <div className="admin-metric-header">
                <span>Outstanding</span>
                <AlertCircle size={19} />
              </div>

              <strong>
                {loading ? '-' : currency(totalOutstanding)}
              </strong>

              <small>Unpaid invoice balances</small>
            </div>

            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Draft invoices</span>
                <FileText size={19} />
              </div>

              <strong>
                {loading ? '-' : draftCount}
              </strong>

              <small>Waiting to be issued</small>
            </div>
          </section>

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>All invoices</h2>
                <p>
                  Manage customer billing records.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh"
                onClick={() => navigate(paymentPath)}
              >
                <Wallet size={17} />
                Record payment
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 12,
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
                  background: '#ffffff',
                }}
              >
                <Search size={18} color="#64748b" />

                <input
                  type="search"
                  aria-label="Search invoices"
                  placeholder="Search invoice or customer..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    font: 'inherit',
                    color: '#334155',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  border: '1px solid #dce2e9',
                  borderRadius: 10,
                  background: '#ffffff',
                }}
              >
                <Filter size={17} color="#64748b" />

                <select
                  aria-label="Filter by invoice status"
                  value={statusFilter}
                  onChange={event =>
                    setStatusFilter(event.target.value)
                  }
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#334155',
                    font: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status === 'ALL'
                        ? 'All statuses'
                        : formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading invoices...
              </p>
            ) : filteredInvoices.length === 0 ? (
              <p className="staff-empty">
                No matching invoices found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table
                  className="customer-invoice-table"
                  style={{
                    width: '100%',
                    minWidth: 900,
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Due date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>{invoice.invoiceNumber}</strong>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#94a3b8',
                              marginTop: 4,
                            }}
                          >
                            ID #{invoice.id}
                          </div>
                        </td>

                        <td>{invoice.customerName}</td>

                        <td>{formatDate(invoice.dueDate)}</td>

                        <td>
                          <span className="customer-status-badge">
                            {formatStatus(invoice.status)}
                          </span>
                        </td>

                        <td>{currency(invoice.totalAmount)}</td>

                        <td>{currency(invoice.balanceDue)}</td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 8,
                            }}
                          >
                            <button
                              className="customer-download-btn"
                              type="button"
                              disabled={downloadingId === invoice.id}
                              onClick={() =>
                                void downloadInvoice(invoice.id)
                              }
                            >
                              <Download size={15} />
                              {downloadingId === invoice.id
                                ? 'Downloading...'
                                : 'PDF'}
                            </button>

                            {invoice.status === 'DRAFT' && (
                              <button
                                className="customer-pay-btn"
                                type="button"
                                disabled={issuingId !== null}
                                onClick={() =>
                                  void issueInvoice(invoice)
                                }
                              >
                                <CheckCircle2 size={15} />
                                {issuingId === invoice.id
                                  ? 'Issuing...'
                                  : 'Issue'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <p
                style={{
                  marginTop: 20,
                  color: '#64748b',
                  fontSize: 13,
                }}
              >
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 22,
              border: 'none',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div className="admin-bottom-note">
            Invoice data is retrieved from your Brightloop Spring Boot APIs.
          </div>
        </main>
      </div>
    </div>
  );
}
