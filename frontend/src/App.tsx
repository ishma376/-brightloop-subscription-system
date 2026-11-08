
import { Navigate, Route, Routes } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StaffInvoicesPage from './pages/StaffInvoicesPage';
import CustomerDashboard from './pages/CustomerDashboard';
import StaffRecordPaymentPage from './pages/StaffRecordPaymentPage';
import StaffCustomersPage from './pages/StaffCustomersPage';
import StaffSubscriptionsPage from './pages/StaffSubscriptionsPage';
import StaffOverduePage from './pages/StaffOverduePage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminReportsPage from './pages/AdminReportsPage';
import CustomerBrowsePlansPage from './pages/CustomerBrowsePlansPage';
import AdminSubscriptionPlansPage from './pages/AdminSubscriptionPlansPage';

import { getAccount, isLoggedIn, type Account } from './auth';

type Role = Account['role'];

const roleDestinations: Record<Role, string> = {
  ADMIN: '/admin/dashboard',
  STAFF: '/staff/dashboard',
  CUSTOMER: '/customer/dashboard',
};

// Redirect users to the correct dashboard.
function DashboardRedirect() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const account = getAccount();

  if (!account || !roleDestinations[account.role]) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleDestinations[account.role]} replace />;
}

// Allow only the required account role.
function ProtectedRoute({ role }: { role: Role }) {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== role) {
    return <DashboardRedirect />;
  }

  if (role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (role === 'STAFF') {
    return <StaffDashboard />;
  }

  return <CustomerDashboard />;
}

// Protect the staff invoice management page.
function StaffInvoicesRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN' && account.role !== 'STAFF') {
    return <DashboardRedirect />;
  }

  return <StaffInvoicesPage />;
}

function StaffRecordPaymentRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN' && account.role !== 'STAFF') {
    return <DashboardRedirect />;
  }

  return <StaffRecordPaymentPage />;
}

function StaffCustomersRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN' && account.role !== 'STAFF') {
    return <DashboardRedirect />;
  }

  return <StaffCustomersPage />;
}

function StaffSubscriptionsRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (
    account.role !== 'ADMIN' &&
    account.role !== 'STAFF'
  ) {
    return <DashboardRedirect />;
  }

  return <StaffSubscriptionsPage />;
}

function StaffOverdueRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'STAFF') {
    return <DashboardRedirect />;
  }

  return <StaffOverduePage />;
}

function AdminProductsRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN') {
    return <DashboardRedirect />;
  }

  return <AdminProductsPage />;
}

function AdminStaffRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN') {
    return <DashboardRedirect />;
  }

  return <AdminStaffPage />;
}

function AdminReportsRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN') {
    return <DashboardRedirect />;
  }

  return <AdminReportsPage />;
}

function CustomerBrowsePlansRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'CUSTOMER') {
    return <DashboardRedirect />;
  }

  return <CustomerBrowsePlansPage />;
}

function AdminSubscriptionPlansRoute() {
  const account = getAccount();

  if (!isLoggedIn() || !account) {
    return <Navigate to="/login" replace />;
  }

  if (account.role !== 'ADMIN') {
    return <DashboardRedirect />;
  }

  return <AdminSubscriptionPlansPage />;
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Redirect based on user role */}
      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />

      {/* ADMIN */}
      <Route
        path="/admin/plans"
        element={<AdminSubscriptionPlansRoute />}
      />

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute role="ADMIN" />}
      />

      {/* STAFF */}
      <Route
        path="/staff/dashboard"
        element={<ProtectedRoute role="STAFF" />}
      />

      {/* STAFF INVOICE MANAGEMENT */}
      <Route
        path="/staff/invoices"
        element={<StaffInvoicesRoute />}
      />

      <Route
        path="/admin/invoices"
        element={<StaffInvoicesRoute />}
      />

      <Route
        path="/staff/payments/record"
        element={<StaffRecordPaymentRoute />}
      />

      <Route
        path="/admin/payments/record"
        element={<StaffRecordPaymentRoute />}
      />

      <Route
        path="/staff/customers"
        element={<StaffCustomersRoute />}
      />

      <Route
        path="/admin/customers"
        element={<StaffCustomersRoute />}
      />

      <Route
        path="/admin/products"
        element={<AdminProductsRoute />}
      />

      <Route
        path="/admin/staff"
        element={<AdminStaffRoute />}
      />

      <Route
        path="/admin/reports"
        element={<AdminReportsRoute />}
      />

      <Route
        path="/staff/subscriptions"
        element={<StaffSubscriptionsRoute />}
      />

      <Route
        path="/admin/subscriptions"
        element={<StaffSubscriptionsRoute />}
      />

      <Route
        path="/staff/overdue"
        element={<StaffOverdueRoute />}
      />

      {/* CUSTOMER */}
      <Route
        path="/customer/dashboard"
        element={<ProtectedRoute role="CUSTOMER" />}
      />

      <Route
        path="/customer/invoices"
        element={<ProtectedRoute role="CUSTOMER" />}
      />

      <Route
        path="/customer/plans"
        element={<CustomerBrowsePlansRoute />}
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
