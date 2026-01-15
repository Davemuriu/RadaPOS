import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ForcePasswordChange from './pages/Auth/ForcePasswordChange';

import Layout from "./components/Layout";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminEvents from "./pages/Admin/AdminEvents";
import AdminVendors from "./pages/Admin/AdminVendors";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminReports from "./pages/Admin/AdminReports";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminWallet from "./pages/Admin/AdminWallet";

import VendorDashboard from './pages/Vendor/Dashboard';
import InventoryPage from './pages/Vendor/InventoryPage';
import StaffPage from './pages/Vendor/StaffPage';
import VendorSalesHistory from './pages/Vendor/SalesHistory';
import WalletPage from './pages/Vendor/WalletPage';
import VendorSettings from './pages/Vendor/SettingsPage';

import CashierDashboard from './pages/POS/CashierDashboard';
import POSPage from './pages/POS/POSPage';
import CashierSettings from './pages/POS/CashierSettings';
import CashierHistory from './pages/POS/CashierHistory';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toUpperCase() || '';
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'VENDOR') return <Navigate to="/vendor/dashboard" replace />;
    if (userRole === 'CASHIER') return <Navigate to="/cashier/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/force-password-change" element={<ForcePasswordChange />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATOR']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="wallet" element={<AdminWallet />} />
          </Route>

          <Route path="/vendor" element={
            <ProtectedRoute allowedRoles={['VENDOR']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="sales" element={<VendorSalesHistory />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>

          <Route path="/cashier" element={
            <ProtectedRoute allowedRoles={['CASHIER']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CashierDashboard />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="history" element={<CashierHistory />} />
            <Route path="settings" element={<CashierSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
