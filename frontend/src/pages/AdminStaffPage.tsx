
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type StaffResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  message: string;
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #dce2e9',
  borderRadius: 10,
  background: '#ffffff',
  color: '#334155',
  font: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
};

export default function AdminStaffPage() {
  const navigate = useNavigate();
  const account = getAccount();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [createdStaff, setCreatedStaff] =
    useState<StaffResponse | null>(null);

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError('');
    setCreatedStaff(null);

    if (account?.role !== 'ADMIN') {
      setError('Only administrators can create staff accounts.');
      return;
    }

    if (password.length < 9) {
      setError('Password must contain at least 9 characters.');
      return;
    }

    const validPassword =
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[^a-zA-Z0-9\s]/.test(password);

    if (!validPassword) {
      setError(
        'Password must contain uppercase, lowercase, and special characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setSaving(true);

    try {
      const response = await axios.post<StaffResponse>(
        '/api/admin/staff',
        {
          name: name.trim(),
          email: email.trim(),
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreatedStaff(response.data);

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        if (status === 403) {
          setError(
            'Access denied. Only administrators can create staff accounts.'
          );
        } else if (status === 409) {
          setError(
            'An account with this email may already exist.'
          );
        } else if (status === 400) {
          setError(
            'Invalid staff details. Check the name, email, and password.'
          );
        } else {
          setError(
            'Unable to confirm staff creation. Check the backend before retrying.'
          );
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link to="/">
            <Brand />
          </Link>
        </div>

        <div className="admin-workspace-label">
          ADMIN WORKSPACE
        </div>

        <nav className="admin-navigation">
          <button
            className="admin-nav-link"
            type="button"
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className="admin-nav-link active"
            type="button"
          >
            <Users size={18} />
            <span>Staff Management</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Administrator workspace</span>
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
            <span>Admin Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Staff Management</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              Admin Portal
            </span>

            <div className="admin-avatar">
              {account?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main
          className="admin-page-body"
          style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}
        >
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                ADMIN / STAFF MANAGEMENT
              </span>

              <h1>
                Staff <span>management.</span>
              </h1>

              <p>
                Create staff accounts and provide access to the
                Brightloop Staff Portal.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {createdStaff && (
            <div
              role="status"
              style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: 18,
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <CheckCircle2 size={21} />
                <strong>Staff account created successfully!</strong>
              </div>

              <p>Name: {createdStaff.name}</p>
              <p>Email: {createdStaff.email}</p>
              <p>Role: {createdStaff.role}</p>
              <p>Staff ID: #{createdStaff.id}</p>
            </div>
          )}

          <section className="admin-data-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Add New Staff Member</h2>
                <p>
                  Create a login account for a new employee.
                </p>
              </div>

              <UserPlus size={22} />
            </div>

            <form onSubmit={(event) => void createStaff(event)}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 20,
                }}
              >
                <div>
                  <label htmlFor="staff-name" style={labelStyle}>
                    Full Name *
                  </label>

                  <input
                    id="staff-name"
                    style={inputStyle}
                    type="text"
                    placeholder="Enter staff name"
                    value={name}
                    required
                    disabled={saving}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="staff-email" style={labelStyle}>
                    Email Address *
                  </label>

                  <input
                    id="staff-email"
                    style={inputStyle}
                    type="email"
                    placeholder="staff@example.com"
                    value={email}
                    required
                    disabled={saving}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="staff-password" style={labelStyle}>
                    Password *
                  </label>

                  <div style={{ position: 'relative' }}>
                    <input
                      id="staff-password"
                      style={{
                        ...inputStyle,
                        paddingRight: 48,
                      }}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      minLength={9}
                      required
                      disabled={saving}
                      autoComplete="new-password"
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create a password"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                    >
                      {showPassword
                        ? <EyeOff size={19} />
                        : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="staff-confirm" style={labelStyle}>
                    Confirm Password *
                  </label>

                  <input
                    id="staff-confirm"
                    style={inputStyle}
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    required
                    disabled={saving}
                    autoComplete="new-password"
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                  />
                </div>
              </div>

              <p
                style={{
                  marginTop: 18,
                  color: '#64748b',
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                Password must be at least 9 characters and include
                an uppercase letter, a lowercase letter,
                and a special character.
              </p>

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
                  disabled={saving}
                >
                  <Plus size={18} />
                  {saving ? 'Creating...' : 'Create Staff Account'}
                </button>

                <button
                  type="button"
                  className="admin-refresh"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <ArrowLeft size={17} />
                  Back to Dashboard
                </button>
              </div>
            </form>
          </section>

          <div className="admin-bottom-note">
            New staff accounts are created through the Brightloop
            Admin API. Staff credentials should be shared privately
            with the intended employee.
          </div>
        </main>
      </div>
    </div>
  );
}
