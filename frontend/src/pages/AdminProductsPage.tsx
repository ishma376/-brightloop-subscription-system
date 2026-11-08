
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
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

type Product = {
  id: number;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes: string | null;
};

type ProductForm = {
  name: string;
  type: string;
  salesPrice: string;
  costPrice: string;
  notes: string;
};

const emptyForm: ProductForm = {
  name: '',
  type: '',
  salesPrice: '',
  costPrice: '',
  notes: '',
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

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const account = getAccount();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductForm>({ ...emptyForm });

  const loadProducts = useCallback(async () => {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get<Product[]>(
        '/api/products',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(response.data);
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
        'Unable to load products. Check backend connection and admin permissions.'
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const productTypes = useMemo(
    () =>
      Array.from(
        new Set(products.map(product => product.type))
      ).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query) ||
        String(product.id).includes(query);

      const matchesType =
        typeFilter === 'ALL' ||
        product.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [products, search, typeFilter]);

  const totalSalesPrice = products.reduce(
    (sum, product) => sum + Number(product.salesPrice || 0),
    0
  );

  const totalCostPrice = products.reduce(
    (sum, product) => sum + Number(product.costPrice || 0),
    0
  );

  const averageSalesPrice =
    products.length > 0
      ? totalSalesPrice / products.length
      : 0;

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
    setError('');
    setSuccess('');
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      type: product.type,
      salesPrice: String(product.salesPrice),
      costPrice: String(product.costPrice),
      notes: product.notes ?? '',
    });

    setFormOpen(true);
    setError('');
    setSuccess('');
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function updateField(
    field: keyof ProductForm,
    value: string
  ) {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    const pricePattern = /^\d+(\.\d{1,2})?$/;

    if (
      !form.name.trim() ||
      !form.type.trim() ||
      !pricePattern.test(form.salesPrice.trim()) ||
      !pricePattern.test(form.costPrice.trim()) ||
      Number(form.salesPrice) >= 10000000000 ||
      Number(form.costPrice) >= 10000000000
    ) {
      setError(
        'Enter a product name, type, and valid non-negative prices with at most two decimal places.'
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type.trim(),
      salesPrice: Number(form.salesPrice),
      costPrice: Number(form.costPrice),
      notes: form.notes.trim() || null,
    };

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingId !== null) {
        await axios.put(
          `/api/products/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess('Product updated successfully.');
      } else {
        await axios.post(
          '/api/products',
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess('Product created successfully.');
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadProducts();
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
        err.response?.status === 403
      ) {
        setError(
          'Your account does not have permission to manage products.'
        );
      } else {
        setError(
          'Unable to save product. Check the information and backend logs before retrying.'
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\n` +
      'This action may be permanent.'
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    setDeletingId(product.id);
    setError('');
    setSuccess('');

    try {
      await axios.delete(
        `/api/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(previous =>
        previous.filter(item => item.id !== product.id)
      );

      if (editingId === product.id) {
        closeForm();
      }

      setSuccess(
        `Product "${product.name}" deleted successfully.`
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
        'Unable to delete product. It may be linked to variants, plans, or other records.'
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-layout">
      {menuOpen && (
        <button
          type="button"
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
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          ADMIN WORKSPACE
        </div>

        <nav className="admin-navigation">
          <button
            type="button"
            className="admin-nav-link"
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className="admin-nav-link active"
          >
            <Package size={18} />
            <span>Products</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Administrator workspace</span>
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

            <span>Admin Workspace</span>
            <span className="admin-breadcrumb-divider">/</span>
            <strong>Products</strong>
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

        <main className="admin-page-body">
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                ADMIN / PRODUCTS
              </span>

              <h1>
                Product <span>management.</span>
              </h1>

              <p>
                Manage your Brightloop products and their pricing.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <button
                className="admin-refresh"
                type="button"
                disabled={loading}
                onClick={() => void loadProducts()}
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
                Add Product
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
                borderRadius: 12,
                border: '1px solid #a7f3d0',
                background: '#ecfdf5',
                color: '#047857',
              }}
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-blue">
              <div className="admin-metric-header">
                <span>Total Products</span>
                <Package size={19} />
              </div>

              <strong>
                {loading ? '—' : products.length}
              </strong>

              <small>Products in catalog</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Average Sales Price</span>
                <Wallet size={19} />
              </div>

              <strong>
                {loading ? '—' : currency(averageSalesPrice)}
              </strong>

              <small>Average catalog selling price</small>
            </div>

            <div className="admin-metric-card metric-purple">
              <div className="admin-metric-header">
                <span>Product Types</span>
                <Package size={19} />
              </div>

              <strong>
                {loading ? '—' : productTypes.length}
              </strong>

              <small>Distinct product categories</small>
            </div>

            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Average Cost Price</span>
                <Wallet size={19} />
              </div>

              <strong>
                {loading
                  ? '—'
                  : currency(
                      products.length
                        ? totalCostPrice / products.length
                        : 0
                    )}
              </strong>

              <small>Average product cost</small>
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
                      ? 'Add new product'
                      : 'Edit product'}
                  </h2>

                  <p>
                    Enter product details and pricing in Indian Rupees.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close form"
                  disabled={saving}
                  onClick={closeForm}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(event) => void saveProduct(event)}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 18,
                }}>
                  <div>
                    <label
                      htmlFor="product-name"
                      style={labelStyle}
                    >
                      Product name *
                    </label>

                    <input
                      id="product-name"
                      type="text"
                      style={inputStyle}
                      value={form.name}
                      required
                      onChange={event =>
                        updateField('name', event.target.value)
                      }
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-type"
                      style={labelStyle}
                    >
                      Product type *
                    </label>

                    <input
                      id="product-type"
                      type="text"
                      style={inputStyle}
                      value={form.type}
                      required
                      onChange={event =>
                        updateField('type', event.target.value)
                      }
                      placeholder="e.g. SERVICE"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sales-price"
                      style={labelStyle}
                    >
                      Sales Price (₹) *
                    </label>

                    <input
                      id="sales-price"
                      type="number"
                      style={inputStyle}
                      min="0"
                      max="9999999999.99"
                      step="0.01"
                      required
                      value={form.salesPrice}
                      onChange={event =>
                        updateField('salesPrice', event.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cost-price"
                      style={labelStyle}
                    >
                      Cost Price (₹) *
                    </label>

                    <input
                      id="cost-price"
                      type="number"
                      style={inputStyle}
                      min="0"
                      max="9999999999.99"
                      step="0.01"
                      required
                      value={form.costPrice}
                      onChange={event =>
                        updateField('costPrice', event.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <label
                    htmlFor="product-notes"
                    style={labelStyle}
                  >
                    Product notes
                  </label>

                  <textarea
                    id="product-notes"
                    style={{
                      ...inputStyle,
                      minHeight: 100,
                      resize: 'vertical',
                    }}
                    value={form.notes}
                    onChange={event =>
                      updateField('notes', event.target.value)
                    }
                    placeholder="Optional product description"
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 24,
                }}>
                  <button
                    type="submit"
                    className="customer-pay-btn"
                    disabled={saving}
                  >
                    <CheckCircle2 size={17} />
                    {saving
                      ? 'Saving...'
                      : editingId === null
                      ? 'Create Product'
                      : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    className="admin-refresh"
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
                <h2>All products</h2>
                <p>
                  View and manage your product catalog.
                </p>
              </div>
              <Package size={20} />
            </div>

            <div style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}>
              <div style={{
                flex: '1 1 240px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                border: '1px solid #dce2e9',
                borderRadius: 10,
                background: '#fff',
              }}>
                <Search size={18} color="#64748b" />

                <input
                  type="search"
                  aria-label="Search products"
                  placeholder="Search products by name or type..."
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
                aria-label="Filter by product type"
                value={typeFilter}
                onChange={event => setTypeFilter(event.target.value)}
                style={{
                  padding: '11px 14px',
                  border: '1px solid #dce2e9',
                  borderRadius: 10,
                  color: '#334155',
                  background: '#fff',
                  font: 'inherit',
                }}
              >
                <option value="ALL">All types</option>

                {productTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="staff-empty">
                No matching products found.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  className="customer-invoice-table"
                  style={{
                    width: '100%',
                    minWidth: 850,
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Sales Price</th>
                      <th>Cost Price</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>

                          <div style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            marginTop: 4,
                          }}>
                            ID #{product.id}
                          </div>
                        </td>

                        <td>{product.type}</td>

                        <td>
                          <strong>
                            {currency(product.salesPrice)}
                          </strong>
                        </td>

                        <td>
                          {currency(product.costPrice)}
                        </td>

                        <td>
                          {product.notes || '—'}
                        </td>

                        <td>
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}>
                            <button
                              type="button"
                              className="admin-refresh"
                              onClick={() => openEditForm(product)}
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-refresh"
                              disabled={deletingId !== null}
                              onClick={() =>
                                void deleteProduct(product)
                              }
                              style={{ color: '#dc2626' }}
                            >
                              <Trash2 size={15} />
                              {deletingId === product.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
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
                fontSize: 13,
                color: '#64748b',
              }}>
                Showing {filteredProducts.length} of{' '}
                {products.length} products
              </p>
            )}
          </section>

          <div className="admin-bottom-note">
            Product data is managed through your Brightloop Spring Boot API.
          </div>
        </main>
      </div>
    </div>
  );
}
