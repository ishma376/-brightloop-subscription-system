
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { saveSession, type Account } from '../auth';

type LoginResponse = Account & {
  token: string;
  tokenType: string;
};

const destinations: Record<Account['role'], string> = {
  ADMIN: '/admin/dashboard',
  STAFF: '/staff/dashboard',
  CUSTOMER: '/customer/dashboard',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post<LoginResponse>(
        '/api/auth/login',
        {
          email: email.trim(),
          password,
        }
      );

      if (!data.token) {
        throw new Error('No access token returned by server.');
      }

      if (!['ADMIN', 'STAFF', 'CUSTOMER'].includes(data.role)) {
        throw new Error('Invalid account role returned by server.');
      }

      saveSession(data.token, {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      navigate(destinations[data.role], {
        replace: true,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Incorrect email or password. Please try again.');
        } else if (!err.response) {
          setError(
            'Cannot reach Brightloop backend. Start Spring Boot on port 8080.'
          );
        } else {
          setError(
            `Sign-in failed (HTTP ${err.response.status}). Please try again.`
          );
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to sign in.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-form-side">
        <div className="login-header">
          <Link to="/">
            <Brand />
          </Link>

          <Link to="/" className="back-home">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="login-center">
          <div className="login-heading">
            <div className="login-spark">
              <Sparkles size={20} />
            </div>

            <span className="small-label">
              YOUR BRIGHTLOOP WORKSPACE
            </span>

            <h1>
              Welcome <span>back.</span>
            </h1>

            <p>
              Good to see you again. Your whole billing world
              is just one sign-in away.
            </p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <label htmlFor="email">Email address</label>

            <div className="input-wrap">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="password-label">
              <label htmlFor="password">Password</label>
              <span>Secure sign in</span>
            </div>

            <div className="input-wrap">
              <LockKeyhole size={19} />

              <input
                id="password"
                type={show ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                className="password-toggle"
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow(!show)}
              >
                {show ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {error && (
              <div role="alert" className="form-error">
                {error}
              </div>
            )}

            <button
              className="btn btn-blue login-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Signing you in...'
                : 'Sign in to Brightloop'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-signup">
            <span>New to Brightloop? </span>
            <Link to="/register">Create an account</Link>
          </div>

          <div className="login-secure">
            <ShieldCheck size={17} />
            Protected access for your team and customers
          </div>
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} Brightloop
          <span>Better billing starts here.</span>
        </div>
      </section>

      <section className="login-promo">
        <div className="login-promo-glow" />

        <span className="login-promo-kicker">
          <span />
          A BRIGHTER WAY TO WORK
        </span>

        <div className="login-promo-middle">
          <div className="promo-illustration">
            <div className="promo-orbit orbit-a" />
            <div className="promo-orbit orbit-b" />

            <div className="promo-main">
              <span className="promo-main-label">
                Your revenue, at a glance
              </span>

              <div className="promo-mini-chart">
                {[45, 69, 55, 81, 67, 92, 77].map(
                  (height, index) => (
                    <div
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="promo-stat">
                <strong>Everything</strong>
                <span>
                  in sync <CheckCircle2 size={16} />
                </span>
              </div>
            </div>

            <div className="promo-float float-a">
              <span>↗</span>

              <div>
                <strong>One clear view</strong>
                <small>All your essentials</small>
              </div>
            </div>

            <div className="promo-float float-b">
              <div className="promo-icon">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <strong>Payments tracked</strong>
                <small>Stay on top of every detail</small>
              </div>
            </div>
          </div>

          <h2>
            All connected.
            <br />
            <em>All under control.</em>
          </h2>

          <p>
            Subscriptions, invoices, and payments —
            finally working in one beautiful flow.
          </p>
        </div>

        <div className="promo-bottom">
          <span>✦</span> LESS ADMIN. MORE MOMENTUM.
        </div>
      </section>
    </main>
  );
}
