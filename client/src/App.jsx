import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* The high-contrast dark Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* The Admin Login screen (appears after clicking Admin on landing) */}
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* The Dashboard with the sidebar and metrics */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Fallback to home if URL is typed wrong */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;