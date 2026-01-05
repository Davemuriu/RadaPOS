import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminVendors from './pages/Admin/AdminVendors'; // Assumed similar to Users
import AdminReports from './pages/Admin/AdminReports'; // Assumed similar to Dashboard
import AdminSettings from './pages/Admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </BrowserRouter>
  );
}