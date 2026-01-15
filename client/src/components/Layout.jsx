import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import NotificationBell from './Common/NotificationBell';
import { Repeat } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)', color: 'var(--text-main)' }}>
            {/* Sidebar (Left) */}
            <Sidebar user={user} onLogout={handleLogout} />

            {/* Main Wrapper (Right Side) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

                {/* TOP HEADER BAR */}
                <header style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    backgroundColor: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.3s ease'
                }}>
                    {/* LEFT SIDE: Greeting */}
                    <div>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
                        </h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                            Here's what's happening today.
                        </p>
                    </div>

                    {/* RIGHT SIDE: Actions & Profile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* User Profile Snippet */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                                <span style={{ display: 'block', fontWeight: '700', color: 'var(--text-main)' }}>
                                    {user?.name || 'User'}
                                </span>
                                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    {user?.role}
                                </span>
                            </div>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                backgroundColor: 'var(--primary)',
                                color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                border: '2px solid rgba(255,255,255,0.1)'
                            }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* SWITCH ROLE BUTTON */}
                        <button
                            onClick={handleLogout}
                            title="Switch Role (Relogin)"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                marginLeft: '10px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.color = 'var(--primary)';
                                e.currentTarget.style.background = 'var(--bg-page)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Repeat size={14} />
                            <span>Switch Role</span>
                        </button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '0', position: 'relative' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}