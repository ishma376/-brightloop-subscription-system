
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { getToken, logout } from '../auth';

type Product = {
  id: number;
  name: string;
  type: string;
};

type BillingPeriod =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

type SubscriptionPlan = {
  id: number;
  name: string;
  productId: number | null;
  billingPeriod: BillingPeriod;
  price: number;
  isActive: boolean;
};

type PlanForm = {
  productId: string;
  name: string;
  billingPeriod: BillingPeriod;
  price: string;
};

const initialForm: PlanForm = {
  productId: '',
  name: '',
  billingPeriod: 'MONTHLY',
  price: '',
};

export default function AdminSubscriptionPlansPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<PlanForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
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

        const [productsResponse, plansResponse] =
          await Promise.all([
            axios.get<Product[]>('/api/products', { headers }),
            axios.get<SubscriptionPlan[]>('/api/plans', {
              headers,
            }),
          ]);

        setProducts(productsResponse.data);
        setPlans(plansResponse.data);
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 401
        ) {
          logout();
          navigate('/login', { replace: true });
          return;
        }

        setError('Unable to load products and plans.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [navigate]);

  async function createPlan(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const price = Number(form.price);
    const productId = Number(form.productId);

    if (
      !form.productId ||
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      !form.name.trim() ||
      !form.price.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(form.price.trim())
    ) {
      setError(
        'Select a product and enter a valid plan name and positive price.'
      );
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    try {
      const payload = {
        productId,
        name: form.name.trim(),
        billingPeriod: form.billingPeriod,
        price,
        minimumQuantity: 1,
        isActive: true,
        allowPause: false,
        allowEarlyClose: false,
        autoClose: false,
        autoRenew: true,
      };

      const response = await axios.post<SubscriptionPlan>(
        '/api/plans',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPlans(previous => [...previous, response.data]);
      setSuccess('Subscription plan created successfully!');
      setForm(initialForm);
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
        setError('A plan with this name already exists.');
      } else {
        setError('Unable to create subscription plan.');
      }
    } finally {
      setSaving(false);
    }
  }

  function productName(productId: number | null) {
    if (productId === null) return 'Not linked';

    return (
      products.find(product => product.id === productId)
        ?.name ?? `Product #${productId}`
    );
  }

  return (
    <div className="admin-layout">
      <main className="admin-content">
        <div className="admin-page-body">
          <Link to="/admin/dashboard">
            ← Back to Admin Dashboard
          </Link>

          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                ADMIN / SUBSCRIPTION PLANS
              </span>
              <h1>
                Manage <span>subscription plans.</span>
              </h1>
              <p>
                Connect your products to purchasable plans.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <p role="status">{success}</p>
          )}

          <section className="admin-data-panel">
            <h2>Create subscription plan</h2>

            <form
              onSubmit={event => void createPlan(event)}
              style={{
                display: 'grid',
                gap: 16,
                marginTop: 20,
                maxWidth: 550,
              }}
            >
              <label htmlFor="plan-product">
                Select Product
              </label>

              <select
                id="plan-product"
                required
                value={form.productId}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    productId: event.target.value,
                  }))
                }
              >
                <option value="">Choose a product</option>

                {products.map(product => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>

              <label htmlFor="plan-name">Plan Name</label>

              <input
                id="plan-name"
                required
                maxLength={150}
                value={form.name}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="Website Maintenance Monthly"
              />

              <label htmlFor="plan-billing">
                Billing Period
              </label>

              <select
                id="plan-billing"
                value={form.billingPeriod}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    billingPeriod:
                      event.target.value as BillingPeriod,
                  }))
                }
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>

              <label htmlFor="plan-price">
                Subscription Price (₹)
              </label>

              <input
                id="plan-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price}
                onChange={event =>
                  setForm(previous => ({
                    ...previous,
                    price: event.target.value,
                  }))
                }
                placeholder="2999"
              />

              <button
                type="submit"
                className="admin-refresh"
                disabled={saving || loading || products.length === 0}
              >
                {saving
                  ? 'Creating...'
                  : 'Create Subscription Plan'}
              </button>
            </form>

            {!loading && products.length === 0 && (
              <p>
                No products found. Create a product first.
              </p>
            )}
          </section>

          <section
            className="admin-data-panel"
            style={{ marginTop: 24 }}
          >
            <h2>Existing subscription plans</h2>

            {loading ? (
              <p>Loading plans...</p>
            ) : plans.length === 0 ? (
              <p>No subscription plans found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="customer-invoice-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Product</th>
                      <th>Billing</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {plans.map(plan => (
                      <tr key={plan.id}>
                        <td>{plan.name}</td>
                        <td>{productName(plan.productId)}</td>
                        <td>{plan.billingPeriod}</td>
                        <td>
                          ₹{Number(plan.price).toLocaleString('en-IN')}
                        </td>
                        <td>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
