
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

import { getToken } from '../auth';

type SubscriptionPlan = {
  id: number;
  name: string;
  billingPeriod: string;
  price: number | string;
  minimumQuantity: number;
  isActive: boolean;
  allowPause: boolean;
  allowEarlyClose: boolean;
  autoClose: boolean;
  autoRenew: boolean;
};

const money = (value: number | string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

const buttonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

function displayPeriod(period: string) {
  return period
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CustomerBrowsePlansPage() {
  const navigate = useNavigate();
  const [checkingOutPlanId, setCheckingOutPlanId] =
    useState<number | null>(null);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlans = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<SubscriptionPlan[]>(
        '/api/plans',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const activePlans = response.data.filter(
        (plan) => plan.isActive === true
      );

      setPlans(activePlans);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        navigate('/login', { replace: true });
        return;
      }

      setError(
        'Unable to load subscription plans. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  async function handleSubscribe(plan: SubscriptionPlan) {
    if (checkingOutPlanId !== null) return;

    const token = getToken();

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setCheckingOutPlanId(plan.id);
    setError('');

    try {
      const response = await axios.post<{
        subscriptionId: number;
        invoiceId: number;
        invoiceNumber: string;
        planName: string;
        amount: number | string;
        currency: string;
        message: string;
      }>(
        '/api/customer/checkout',
        { planId: plan.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const invoiceId = response.data.invoiceId;

      if (!invoiceId) {
        throw new Error('Checkout did not return an invoice ID.');
      }

      // Redirect to the existing customer invoice payment page.
      navigate('/customer/invoices', {
        state: {
          checkoutInvoiceId: invoiceId,
        },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        if (err.response?.status === 409) {
          setError(
            'You already have this subscription or a purchase that requires review.'
          );
        } else {
          setError(
            'Unable to start checkout. Please try again.'
          );
        }
      } else {
        setError('Unable to start checkout.');
      }
    } finally {
      setCheckingOutPlanId(null);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f4f9',
        padding: '32px clamp(16px, 5vw, 60px)',
        color: '#172b4d',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
            marginBottom: 38,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: 1.5,
                fontWeight: 700,
                color: '#7490b1',
              }}
            >
              MY BRIGHTLOOP / EXPLORE PLANS
            </p>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                margin: '12px 0',
              }}
            >
              Find your perfect{' '}
              <span style={{ color: '#3678d8' }}>plan.</span>
            </h1>

            <p style={{ color: '#788ca7' }}>
              Explore available subscription plans and choose
              the one that suits your needs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              style={{
                ...buttonStyle,
                background: '#fff',
                color: '#475569',
                border: '1px solid #d5e0ed',
              }}
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => void loadPlans()}
              disabled={loading}
              style={{
                ...buttonStyle,
                background: '#fff',
                color: '#3678d8',
                border: '1px solid #d5e0ed',
              }}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </header>

        <section
          style={{
            background:
              'linear-gradient(120deg, #2466be, #4592eb)',
            color: 'white',
            borderRadius: 22,
            padding: '32px clamp(20px, 5vw, 48px)',
            marginBottom: 32,
          }}
        >
          <ShoppingBag size={30} />

          <h2 style={{ fontSize: 26, margin: '15px 0 8px' }}>
            Explore Brightloop subscriptions
          </h2>

          <p style={{ opacity: 0.9, maxWidth: 600 }}>
            Browse our active plans, compare prices and billing
            periods, and find the right subscription.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              background: '#fff1f2',
              color: '#be123c',
              padding: 18,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: 22, margin: 0 }}>
            Available Plans
          </h2>

          {!loading && !error && (
            <span style={{ color: '#64748b', fontSize: 13 }}>
              {plans.length} active plan(s)
            </span>
          )}
        </div>

        {loading && <p>Loading available plans...</p>}

        {!loading && !error && plans.length === 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: 18,
              padding: 50,
              textAlign: 'center',
            }}
          >
            <ShoppingBag
              size={38}
              color="#94a3b8"
              style={{ margin: '0 auto' }}
            />

            <h3>No plans available yet</h3>

            <p style={{ color: '#64748b' }}>
              Subscription plans will appear here once
              the administrator activates them.
            </p>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 22,
          }}
        >
          {!loading &&
            !error &&
            plans.map((plan) => (
              <article
                key={plan.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e1e8f1',
                  borderRadius: 20,
                  padding: 26,
                  boxShadow: '0 8px 25px rgba(25,55,90,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      background: '#e8f1ff',
                      color: '#3678d8',
                      borderRadius: 13,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <ShoppingBag size={23} />
                  </div>

                  <span
                    style={{
                      background: '#e8f8f0',
                      color: '#12845b',
                      borderRadius: 20,
                      padding: '6px 11px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 21,
                    marginTop: 25,
                    marginBottom: 12,
                  }}
                >
                  {plan.name}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <strong
                    style={{
                      fontSize: 30,
                      color: '#2366b8',
                    }}
                  >
                    {money(plan.price)}
                  </strong>
                </div>

                <p
                  style={{
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <CalendarDays size={16} />
                  Billing period: {displayPeriod(plan.billingPeriod)}
                </p>

                <hr
                  style={{
                    border: 0,
                    borderTop: '1px solid #e2e8f0',
                    margin: '24px 0',
                  }}
                />

                <div
                  style={{
                    display: 'grid',
                    gap: 15,
                    fontSize: 14,
                    color: '#475569',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <CheckCircle2 size={18} color="#16a34a" />
                    Minimum quantity: {plan.minimumQuantity}
                  </div>

                  {plan.autoRenew && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <CheckCircle2 size={18} color="#16a34a" />
                      Automatic renewal supported
                    </div>
                  )}

                  {plan.allowPause && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <CheckCircle2 size={18} color="#16a34a" />
                      Subscription pausing supported
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={checkingOutPlanId !== null}
                  onClick={() => void handleSubscribe(plan)}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    marginTop: 30,
                    background: '#3678d8',
                    border: 'none',
                    color: '#ffffff',
                    opacity: checkingOutPlanId !== null ? 0.6 : 1,
                    cursor: checkingOutPlanId !== null
                      ? 'wait'
                      : 'pointer',
                  }}
                >
                  <CreditCard size={18} />
                  {checkingOutPlanId === plan.id
                    ? 'Preparing checkout...'
                    : 'Subscribe Now'}
                </button>
              </article>
            ))}
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginTop: 45,
            fontSize: 12,
          }}
        >
          Brightloop · Subscriptions, Simplified
        </p>
      </div>
    </div>
  );
}
