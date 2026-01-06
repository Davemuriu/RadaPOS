import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public & Auth Pages
import LandingPage from "./pages/LandingPage.jsx";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminForgotPassword from "./pages/Admin/AdminForgotPassword.jsx"; // New

// Shell & Protected Pages
import AdminShell from "./pages/Admin/AdminShell.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import AdminVendors from "./pages/Admin/AdminVendors.jsx";
import AdminUsers from "./pages/Admin/AdminUsers.jsx";
import AdminReports from "./pages/Admin/AdminReports.jsx";
import AdminSettings from "./pages/Admin/AdminSettings.jsx";

export default function App() {
  const [adminUser, setAdminUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // 1. Sync state with localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Auth sync failed:", error);
        setAdminUser(null);
      }
    }
    setHydrated(true);
  }, []);

  const handleAdminLogin = (user) => {
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setAdminUser(null);
  };

  // 2. BULLETPROOF AUTH CHECK
  const isAdminAuthed = useMemo(() => {
    const token = localStorage.getItem("access_token");
    const currentRole = adminUser?.admin_role || adminUser?.role;
    // Checks for both API variations
    const hasPermission = currentRole === "administrator" || currentRole === "admin";

    return Boolean(token && hasPermission);
  }, [adminUser]);

  // 3. Protected Route Wrapper
  const RequireAdmin = ({ children }) => {
    if (!hydrated) return null; // Wait for localStorage to be read

    if (!isAdminAuthed) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Role Selection */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Login - Redirects to dashboard if already authed */}
        <Route
          path="/admin/login"
          element={
            isAdminAuthed ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />

        {/* Forgot Password - Added outside the Shell so it's publicly accessible */}
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Protected Admin Shell & Sub-routes */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminShell user={adminUser} onLogout={handleAdminLogout} />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Role Placeholder Routes (To prevent 404 on Landing Page clicks) */}
        <Route path="/vendor/login" element={<div className="bg-[#0B0E11] min-h-screen text-white p-10 font-sans">Vendor Login Coming Soon</div>} />
        <Route path="/cashier/login" element={<div className="bg-[#0B0E11] min-h-screen text-white p-10 font-sans">Cashier Login Coming Soon</div>} />

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}