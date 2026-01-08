import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Vendor/Dashboard';
import Inventory from './pages/Vendor/Inventory';
import Staff from './pages/Vendor/Staff';
import Login from './pages/Auth/Login';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/NavBar';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes with Navbar */}
                <Route path="/vendor/*" element={
                    <PrivateRoute>
                        <div>
                            <Navbar />
                            <div style={{ padding: '20px' }}>
                                <Routes>
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="inventory" element={<Inventory />} />
                                    <Route path="staff" element={<Staff />} />
                                </Routes>
                            </div>
                        </div>
                    </PrivateRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/vendor/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;