import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminShell from "./pages/Admin/AdminShell.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import AdminVendors from "./pages/Admin/AdminVendors.jsx";
import AdminUsers from "./pages/Admin/AdminUsers.jsx";
import AdminReports from "./pages/Admin/AdminReports.jsx";
import AdminSettings from "./pages/Admin/AdminSettings.jsx";

export default function App() {
  const [adminUser, setAdminUser] = useState(null);

  const handleAdminLogin = (user) => setAdminUser(user);
  const handleAdminLogout = () => setAdminUser(null);

  const RequireAdmin = ({ children }) => {
    if (!adminUser) return <Navigate to="/admin/login" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin onLogin={handleAdminLogin} />}
        />

        {/* Admin Protected Area */}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
