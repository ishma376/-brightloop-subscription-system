
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';

import { Brand } from '../components/Brand';
import { getAccount, getToken, logout } from '../auth';

// Invoice data returned by Spring Boot
type CustomerInvoice = {
  id: number;
  invoiceNumber: string;
  status: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

// Razorpay order response from backend
type RazorpayOrderResponse = {
  orderId: string;
  invoiceId: number;
  amount: number;
  currency: string;
  keyId: string;
};

// Razorpay Checkout success response
type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    handler: (response: unknown) => void
  ) => void;
};

// Razorpay is loaded from index.html
declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

// Format amounts as Indian Rupees
const currency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const account = getAccount();

  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const [payingInvoiceId, setPayingInvoiceId] = useState<
    number | null
  >(null);

  const [selectedInvoice, setSelectedInvoice] =
    useState<CustomerInvoice | null>(null);

  const [paymentType, setPaymentType] =
    useState<'FULL' | 'PARTIAL'>('FULL');

  const [partialAmount, setPartialAmount] = useState('');

  const paymentInProgress = useRef(false);
  const verificationInProgress = useRef(false);

  // Load invoices belonging to logged-in customer
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
      const response = await axios.get<CustomerInvoice[]>(
        '/api/customer/invoices',
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

      setError('Unable to load your invoices.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  // Logout customer
  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  // Download invoice PDF
  async function downloadInvoice(invoiceId: number) {
    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    try {
      const response = await axios.get(
        `/api/customer/invoices/${invoiceId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `brightloop-invoice-${invoiceId}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to download this invoice PDF.');
    }
  }

  // Razorpay checkout
  async function payInvoice(
    invoice: CustomerInvoice,
    requestedAmount?: number
  ) {
    if (paymentInProgress.current) {
      return;
    }

    const token = getToken();

    if (!token) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    if (!window.Razorpay) {
      setError(
        'Razorpay Checkout could not load. Check your internet connection.'
      );
      return;
    }

    paymentInProgress.current = true;
    setPayingInvoiceId(invoice.id);
    setError('');
    setPaymentMessage('');

    const finishPayment = () => {
      paymentInProgress.current = false;
      verificationInProgress.current = false;
      setPayingInvoiceId(null);
    };

    try {
      // Step 1: Create Razorpay order through backend
      const response = await axios.post<RazorpayOrderResponse>(
        `/api/customer/payments/invoices/${invoice.id}/order`,
        requestedAmount === undefined
          ? {}
          : { amount: requestedAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = response.data;

      if (
        !order.orderId ||
        !order.keyId ||
        !Number.isSafeInteger(order.amount) ||
        order.amount <= 0 ||
        order.currency !== 'INR' ||
        Number(order.invoiceId) !== invoice.id
      ) {
        throw new Error('Invalid Razorpay order response');
      }

      // Step 2: Open Razorpay Checkout
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Brightloop',
        description: `Payment for ${invoice.invoiceNumber}`,
        order_id: order.orderId,

        prefill: {
          name: account?.name,
          email: account?.email,
        },

        // Step 3: Verify payment through Spring Boot
        handler: (payment: RazorpayCheckoutResponse) => {
          verificationInProgress.current = true;

          void (async () => {
            try {
              if (
                payment.razorpay_order_id !== order.orderId ||
                !payment.razorpay_payment_id ||
                !payment.razorpay_signature
              ) {
                throw new Error('Invalid payment response');
              }

              await axios.post(
                '/api/customer/payments/verify',
                {
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Step 4: Refresh invoices after verification
              await loadInvoices();

              setPaymentMessage(
                'Payment verified successfully. Your invoice has been updated.'
              );
            } catch {
              setError(
                'Payment verification could not be confirmed. Check your invoice status before attempting another payment.'
              );
            } finally {
              finishPayment();
            }
          })();
        },

        modal: {
          ondismiss: () => {
            if (
              paymentInProgress.current &&
              !verificationInProgress.current
            ) {
              finishPayment();
            }
          },
        },
      });

      checkout.on('payment.failed', () => {
        setError(
          'Razorpay reported that the payment failed. Please check your payment status.'
        );

        finishPayment();
      });

      checkout.open();
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.status === 401
      ) {
        logout();
        navigate('/login', { replace: true });
      } else {
        setError(
          'Unable to start Razorpay Checkout. Please try again.'
        );
      }

      finishPayment();
    }
  }

  function openPaymentOptions(invoice: CustomerInvoice) {
    if (paymentInProgress.current) return;

    setSelectedInvoice(invoice);
    setPaymentType('FULL');
    setPartialAmount('');
    setError('');
    setPaymentMessage('');
  }

  // Dashboard calculations
  const outstanding = invoices
    .filter(
      invoice =>
        !['DRAFT', 'CANCELLED'].includes(invoice.status)
    )
    .reduce(
      (sum, invoice) =>
        sum + Number(invoice.balanceDue || 0),
      0
    );

  const paidInvoices = invoices.filter(
    invoice => invoice.status === 'PAID'
  ).length;

  const unpaidInvoices = invoices.filter(
    invoice =>
      invoice.balanceDue > 0 &&
      !['DRAFT', 'CANCELLED'].includes(invoice.status)
  ).length;

  return (
    <div className="admin-layout">
      {/* Mobile navigation backdrop */}
      {menuOpen && (
        <button
          className="admin-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
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
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-workspace-label">
          MY ACCOUNT
        </div>

        <nav className="admin-navigation">
          <button
            className="admin-nav-link active"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className="admin-nav-link"
            type="button"
            title="View your invoices"
            onClick={() => {
              setMenuOpen(false);

              document
                .getElementById('my-invoices')
                ?.scrollIntoView({
                  behavior: 'smooth',
                });
            }}
          >
            <FileText size={18} />
            My invoices
          </button>

          <button
            className="admin-nav-link"
            type="button"
            title="View invoices available for payment"
            onClick={() => {
              setMenuOpen(false);

              document
                .getElementById('my-invoices')
                ?.scrollIntoView({
                  behavior: 'smooth',
                });
            }}
          >
            <CreditCard size={18} />
            Payments
          </button>

          <button
            className="admin-nav-link"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              navigate('/customer/plans');
            }}
          >
            Browse Plans
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-role-info">
            <ShieldCheck size={18} />
            <span>Customer portal</span>
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

      {/* Main content */}
      <div className="admin-content">
        {/* Topbar */}
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

            <span>My account</span>

            <span className="admin-breadcrumb-divider">
              /
            </span>

            <strong>Overview</strong>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-status">
              <span />
              Customer Portal
            </span>

            <div className="admin-avatar">
              {account?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
          </div>
        </header>

        <main className="admin-page-body">
          {/* Page heading */}
          <div className="admin-page-heading">
            <div>
              <span className="admin-section-label">
                MY BRIGHTLOOP / OVERVIEW
              </span>

              <h1>
                Hello,{' '}
                <span>
                  {account?.name?.split(' ')[0] || 'there'}.
                </span>
              </h1>

              <p>
                Your invoices and payments, all in one place.
              </p>
            </div>

            <button
              className="admin-refresh"
              type="button"
              onClick={() => void loadInvoices()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="admin-error"
              role="alert"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Payment success message */}
          {paymentMessage && (
            <div
              className="admin-error"
              role="status"
            >
              <ShieldCheck size={18} />
              {paymentMessage}
            </div>
          )}

          {/* Payment selection window */}
          {selectedInvoice && (
            <div
              role="presentation"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 20,
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Choose payment amount"
                style={{
                  background: '#fff',
                  padding: 28,
                  borderRadius: 16,
                  width: '100%',
                  maxWidth: 440,
                  display: 'grid',
                  gap: 16,
                }}
              >
                <h2>Choose payment amount</h2>

                <p>
                  Invoice: {selectedInvoice.invoiceNumber}
                </p>

                <p>
                  Outstanding balance:{' '}
                  {currency(selectedInvoice.balanceDue)}
                </p>

                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'FULL'}
                    onChange={() => setPaymentType('FULL')}
                  />
                  {' '}Pay full amount
                </label>

                <label>
                  <input
                    type="radio"
                    name="paymentType"
                    checked={paymentType === 'PARTIAL'}
                    onChange={() => setPaymentType('PARTIAL')}
                  />
                  {' '}Pay partial amount
                </label>

                {paymentType === 'PARTIAL' && (
                  <label>
                    Enter amount (₹)
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={partialAmount}
                      onChange={event =>
                        setPartialAmount(event.target.value)
                      }
                      placeholder="1000"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: 12,
                        marginTop: 8,
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                      }}
                    />
                  </label>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    className="admin-refresh"
                    disabled={payingInvoiceId !== null}
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="customer-pay-btn"
                    disabled={
                      payingInvoiceId !== null ||
                      (paymentType === 'PARTIAL' &&
                        (!partialAmount.trim() ||
                          !/^\d+(\.\d{1,2})?$/.test(partialAmount) ||
                          Number(partialAmount) < 1 ||
                          Number(partialAmount) >=
                            selectedInvoice.balanceDue))
                    }
                    onClick={() => {
                      const invoice = selectedInvoice;
                      const amount =
                        paymentType === 'PARTIAL'
                          ? Number(partialAmount)
                          : undefined;

                      setSelectedInvoice(null);
                      void payInvoice(invoice, amount);
                    }}
                  >
                    Continue to Razorpay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard summary */}
          <section className="admin-metric-grid">
            <div className="admin-metric-card metric-blue">
              <div className="admin-metric-header">
                <span>My invoices</span>
                <FileText size={19} />
              </div>

              <strong>
                {loading ? '-' : invoices.length}
              </strong>

              <small>Total invoice records</small>
            </div>

            <div className="admin-metric-card metric-green">
              <div className="admin-metric-header">
                <span>Paid invoices</span>
                <Wallet size={19} />
              </div>

              <strong>
                {loading ? '-' : paidInvoices}
              </strong>

              <small>Completed payments</small>
            </div>

            <div className="admin-metric-card metric-purple">
              <div className="admin-metric-header">
                <span>Outstanding amount</span>
                <CreditCard size={19} />
              </div>

              <strong>
                {loading ? '-' : currency(outstanding)}
              </strong>

              <small>Amount still payable</small>
            </div>

            <div className="admin-metric-card metric-orange">
              <div className="admin-metric-header">
                <span>Unpaid invoices</span>
                <AlertCircle size={19} />
              </div>

              <strong>
                {loading ? '-' : unpaidInvoices}
              </strong>

              <small>Issued or overdue invoices</small>
            </div>
          </section>

          {/* Invoice table */}
          <section
            className="admin-data-panel customer-invoices-panel"
            id="my-invoices"
          >
            <div className="admin-panel-heading">
              <div>
                <h2>My invoices</h2>

                <p>
                  View your billing history and download invoices.
                </p>
              </div>

              <FileText size={20} />
            </div>

            {loading ? (
              <p className="staff-empty">
                Loading your invoices...
              </p>
            ) : invoices.length === 0 ? (
              <div className="customer-empty">
                <FileText size={32} />

                <h3>No invoices yet</h3>

                <p>
                  Your invoices will appear here when they are available.
                </p>
              </div>
            ) : (
              <div className="customer-invoice-table-wrap">
                <table className="customer-invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Due date</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>
                          <strong>
                            {invoice.invoiceNumber}
                          </strong>
                        </td>

                        <td>
                          {invoice.dueDate || '-'}
                        </td>

                        <td>
                          <span className="customer-status-badge">
                            {invoice.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td>
                          {currency(invoice.totalAmount)}
                        </td>

                        <td>
                          {currency(invoice.balanceDue)}
                        </td>

                        <td>
                          <button
                            className="customer-download-btn"
                            type="button"
                            onClick={() =>
                              void downloadInvoice(invoice.id)
                            }
                            title="Download invoice PDF"
                          >
                            <Download size={16} />
                            PDF
                          </button>

                          {invoice.balanceDue > 0 &&
                            [
                              'ISSUED',
                              'PARTIALLY_PAID',
                              'OVERDUE',
                            ].includes(invoice.status) && (
                              <button
                                className="customer-pay-btn"
                                type="button"
                                disabled={
                                  payingInvoiceId !== null
                                }
                                onClick={() => openPaymentOptions(invoice)}
                                title="Pay securely with Razorpay"
                              >
                                {payingInvoiceId === invoice.id
                                  ? 'Processing...'
                                  : 'Pay Now'}

                                <ArrowRight size={14} />
                              </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="admin-bottom-note">
            Your account can only access invoices belonging to you.
          </div>
        </main>
      </div>
    </div>
  );
}
