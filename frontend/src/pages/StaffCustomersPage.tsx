
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string | null;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
};

const emptyForm: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  isActive: true,
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #dce2e9',
  borderRadius: 10,
  background: '#fff',
  color: '#334155',
  font: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 7,
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
};

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function StaffCustomersPage() {
  const navigate = useNavigate();
  const account = getAccount();
  const isAdmin = account?.role === 'ADMIN';

  const dashboardPath = isAdmin
    ? '/admin/dashboard'
    : '/staff/dashboard';

  const workspaceName = isAdmin
    ? 'Admin Workspace'
    : 'Staff Workspace';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerForm>({ ...emptyForm });

  const loadCustomers = useCallback(async () => {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<Customer[]>(
        '/api/customers',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(response.data);
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
        'Unable to load customers. Check backend connectivity and staff permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone ?? '').toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const activeCount = customers.filter(
    (customer) => customer.isActive
  ).length;

  const inactiveCount = customers.length - activeCount;

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setSuccess('');
    setFormOpen(true);
  }

  function openEditForm(customer: Customer) {
    setEditingId(customer.id);

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      isActive: customer.isActive,
    });

    setError('');
    setSuccess('');
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function updateField<K extends keyof CustomerForm>(
    field: K,
    value: CustomerForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    const payload: CustomerForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      isActive: form.isActive,
    };

    if (!payload.name || !payload.email) {
      setError('Customer name and email are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingId !== null) {
        await axios.put(
          `/api/customers/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess('Customer updated successfully.');
      } else {
        await axios.post(
          '/api/customers',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess('Customer created successfully.');
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      // Reload the customer list.
      await loadCustomers();
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      if (
        axios.isAxiosError(err) &&
        err.response?.status === 409
      ) {
        setError(
          'This customer may already exist. Check the email address.'
        );
      } else {
        setError(
          'Unable to save customer. Check the information and your permissions.'
        );
      }
    } finally {
      setSaving(false);
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

      <aside
        className={`admin-sidebar ${menuOpen ? 'open' : ''}`}
      >
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
            <Users size={18} />
            <span>Customers</span>
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
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <span>{workspaceName}</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Customers</strong>
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
                {isAdmin ? 'ADMIN / CUSTOMERS' : 'STAFF / CUSTOMERS'}
              </span>

              <h1>
                Customer <span>management.</span>
              </h1>

              <p>
                View, add, and manage your Brightloop customers.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                className="admin-refresh"
                type="button"
                disabled={loading}
                onClick={() => void loadCustomers()}
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                className="customer-pay-btn"
                type="button"
                onClick={openCreateForm}
              >
                <Plus size={17} />
                Add Customer
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
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-blue">
              <div className="admin-metric-header">
                <span>Total Customers</span>
                <Users size={19} />
              </div>

              <strong>{loading ? '—' : customers.length}</strong>
              <small>Registered customer records</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Active Customers</span>
                <CheckCircle2 size={19} />
              </div>

              <strong>{loading ? '—' : activeCount}</strong>
              <small>Currently active</small>
            </div>

            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Inactive Customers</span>
                <AlertCircle size={19} />
              </div>

              <strong>{loading ? '—' : inactiveCount}</strong>
              <small>Currently inactive</small>
            </div>
          </section>

          {formOpen && (
            <section
              className="admin-data-panel"
              style={{ marginBottom: 24 }}
            >
              <div className="admin-panel-heading">
                <div>
                  <h2>
                    {editingId === null
                      ? 'Add new customer'
                      : 'Edit customer'}
                  </h2>

                  <p>Enter the customer's information.</p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Close form"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(event) => void saveCustomer(event)}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 18,
                  }}
                >
                  <div>
                    <label htmlFor="customer-name" style={labelStyle}>
                      Customer name *
                    </label>

                    <input
                      id="customer-name"
                      style={inputStyle}
                      type="text"
                      maxLength={150}
                      required
                      value={form.name}
                      onChange={(event) =>
                        updateField('name', event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="customer-email" style={labelStyle}>
                      Email address *
                    </label>

                    <input
                      id="customer-email"
                      style={inputStyle}
                      type="email"
                      maxLength={255}
                      required
                      value={form.email}
                      onChange={(event) =>
                        updateField('email', event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="customer-phone" style={labelStyle}>
                      Phone number
                    </label>

                    <input
                      id="customer-phone"
                      style={inputStyle}
                      type="tel"
                      maxLength={20}
                      value={form.phone}
                      onChange={(event) =>
                        updateField('phone', event.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="customer-status" style={labelStyle}>
                      Customer status *
                    </label>

                    <select
                      id="customer-status"
                      style={inputStyle}
                      value={form.isActive ? 'true' : 'false'}
                      onChange={(event) =>
                        updateField(
                          'isActive',
                          event.target.value === 'true'
                        )
                      }
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <label htmlFor="customer-address" style={labelStyle}>
                    Address
                  </label>

                  <textarea
                    id="customer-address"
                    style={{
                      ...inputStyle,
                      minHeight: 90,
                      resize: 'vertical',
                    }}
                    value={form.address}
                    onChange={(event) =>
                      updateField('address', event.target.value)
                    }
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginTop: 24,
                  }}
                >
                  <button
                    className="customer-pay-btn"
                    type="submit"
                    disabled={saving}
                  >
                    <CheckCircle2 size={17} />

                    {saving
                      ? 'Saving...'
                      : editingId === null
                      ? 'Create Customer'
                      : 'Save Changes'}
                  </button>

                  <button
                    className="admin-refresh"
                    type="button"
                    disabled={saving}
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>All customers</h2>
                <p>Manage customer accounts and contact details.</p>
              </div>

              <Users size={20} />
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
                placeholder="Search by name, email or phone..."
                aria-label="Search customers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  font: 'inherit',
                  flex: 1,
                  minWidth: 0,
                }}
              />
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading customers...
              </p>
            ) : filteredCustomers.length === 0 ? (
              <p className="staff-empty">
                No matching customers found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="customer-invoice-table"
                  style={{
                    width: '100%',
                    minWidth: 750,
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <strong>{customer.name}</strong>

                          <div
                            style={{
                              color: '#94a3b8',
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            ID #{customer.id}
                          </div>
                        </td>

                        <td>{customer.email}</td>

                        <td>{customer.phone || '—'}</td>

                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              background: customer.isActive
                                ? '#dcfce7'
                                : '#fee2e2',
                              color: customer.isActive
                                ? '#166534'
                                : '#991b1b',
                            }}
                          >
                            {customer.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        <td>{formatDate(customer.createdAt)}</td>

                        <td>
                          <button
                            type="button"
                            className="admin-refresh"
                            onClick={() => openEditForm(customer)}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
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
                  color: '#64748b',
                  fontSize: 13,
                  marginTop: 20,
                }}
              >
                Showing {filteredCustomers.length} of{' '}
                {customers.length} customers
              </p>
            )}
          </section>

          <div className="admin-bottom-note">
            Customer data is managed through your Brightloop Spring Boot API.
          </div>
        </main>
      </div>
    </div>
  );
}
