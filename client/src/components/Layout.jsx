import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
            {/* Your Existing Sidebar */}
            <Sidebar user={user} onLogout={handleLogout} />

            {/* The Page Content Area */}
            <main style={{ flex: 1, overflowY: 'auto', height: '100vh', position: 'relative' }}>
                <Outlet />
            </main>
        </div>
    );
}