
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Brand } from '../components/Brand';

type RegisterResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  message: string;
};

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      password.length < 9 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[^a-zA-Z0-9\s]/.test(password)
    ) {
      setError(
        'Password must have at least 9 characters, uppercase, lowercase and a special character.'
      );
      return;
    }

    setLoading(true);

    try {
      await axios.post<RegisterResponse>('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      navigate('/login', {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError('This email is already registered. Please sign in.');
        } else if (!err.response) {
          setError(
            'Cannot reach Brightloop backend. Check that Spring Boot is running.'
          );
        } else {
          setError(
            `Registration failed (HTTP ${err.response.status}).`
          );
        }
      } else {
        setError('Something went wrong. Please try again.');
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
              GET STARTED WITH BRIGHTLOOP
            </span>

            <h1>
              Your workspace <span>starts here.</span>
            </h1>

            <p>
              Create your account and bring your subscriptions,
              invoices, and payments into one simple place.
            </p>
          </div>

          <form className="login-form" onSubmit={handleRegister}>
            <label htmlFor="name">Full name</label>

            <div className="input-wrap">
              <UserRound size={19} />

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label htmlFor="email">Email address</label>

            <div className="input-wrap">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="password">Password</label>

            <div className="input-wrap">
              <LockKeyhole size={19} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label htmlFor="confirmPassword">Confirm password</label>

            <div className="input-wrap">
              <LockKeyhole size={19} />

              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-blue login-submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="login-signup">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>

          <div className="login-secure">
            <ShieldCheck size={17} />
            Secure customer registration
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
          <span /> A SIMPLER WAY TO STAY CONNECTED
        </span>

        <div className="login-promo-middle">
          <div className="promo-illustration">
            <div className="promo-orbit orbit-a" />
            <div className="promo-orbit orbit-b" />

            <div className="promo-main">
              <span className="promo-main-label">
                Your subscriptions, organized
              </span>

              <div className="promo-mini-chart">
                {[35, 50, 42, 67, 60, 82, 94].map(
                  (height, index) => (
                    <div
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="promo-stat">
                <strong>One place</strong>
                <span>All connected</span>
              </div>
            </div>
          </div>

          <h2>
            Stay in the loop.
            <br />
            <em>Stay in control.</em>
          </h2>

          <p>
            A simpler way to manage your billing experience.
          </p>
        </div>

        <div className="promo-bottom">
          ✦ LESS ADMIN. MORE MOMENTUM.
        </div>
      </section>
    </main>
  );
}
