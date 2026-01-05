import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './app.css';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors'; // Assumed similar to Users
import AdminReports from './pages/admin/AdminReports'; // Assumed similar to Dashboard
import AdminSettings from './pages/admin/AdminSettings';

const Run = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/vendors" element={<AdminVendors />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')).render(<Run />);