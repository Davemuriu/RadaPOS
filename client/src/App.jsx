import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

/* Admin Dashboard Route Addition */

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Default route */}
        <Route path="/" element={<div className="p-20 text-center"><h1>Welcome to RadaPOS</h1><a href="/admin" className="text-blue-600 underline">Go to Admin</a></div>} />
      </Routes>
    </Router>
  );
}

export default App;