import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    User, Lock, Bell, Save, Shield, AlertTriangle, Loader2,
    Sun, Moon, CheckCircle
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const VendorSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [profile, setProfile] = useState({
        name: '', email: '', business_name: '', phone_number: ''
    });

    const [passwords, setPasswords] = useState({
        current_password: '', new_password: '', confirm_password: ''
    });

    const [notifications, setNotifications] = useState({
        notify_stock: true, notify_sales: false, notify_email: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/settings/profile');
                setProfile({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    business_name: res.data.business_name || '',
                    phone_number: res.data.phone_number || ''
                });

                setNotifications({
                    notify_stock: res.data.notify_stock,
                    notify_sales: res.data.notify_sales,
                    notify_email: res.data.notify_email
                });
            } catch (err) {
                console.error("Error loading settings", err);
            }
        };
        fetchData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(null); setError(null);
        try {
            await api.put('/settings/profile', profile);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError("Failed to update profile details.");
        } finally { setLoading(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            setError("New passwords do not match."); return;
        }
        setLoading(true); setMessage(null); setError(null);
        try {
            await api.put('/settings/security/password', {
                current_password: passwords.current_password,
                new_password: passwords.new_password
            });
            setMessage("Security credentials updated!");
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.response?.data?.msg || "Password update failed.");
        } finally { setLoading(false); }
    };

    const handleSaveNotifications = async () => {
        setLoading(true); setMessage(null);
        try {
            await api.put('/settings/notifications', notifications);
            setMessage("Preferences saved successfully.");
        } catch (err) {
            setError("Failed to save notification preferences.");
        } finally { setLoading(false); }
    };

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">System Settings</h1>
                    <p className="page-subtitle">Manage your profile, security, and alerts</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <div className="settings-sidebar glass-panel">
                    <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <User size={18} /> Profile & Business
                    </button>
                    <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                        <Shield size={18} /> Security
                    </button>
                    <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                        <Bell size={18} /> Notifications
                    </button>
                </div>

                {/* Content Area */}
                <div className="settings-content glass-panel">
                    {message && <div className="alert-box success"><CheckCircle size={16} /> {message}</div>}
                    {error && <div className="alert-box error"><AlertTriangle size={16} /> {error}</div>}

                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="settings-form animate-fade-in">
                            <div className="panel-header mb-6">
                                <div className="header-icon"><User size={18} className="text-primary" /></div>
                                <h3>Personal Information</h3>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Owner Name</label>
                                    <input className="form-input" type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email (Login)</label>
                                    <input className="form-input disabled" type="email" value={profile.email} disabled />
                                </div>
                            </div>

                            <h3 className="section-subtitle mt-8 mb-4">Business Profile</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Business Name</label>
                                    <input className="form-input" type="text" value={profile.business_name} onChange={e => setProfile({ ...profile, business_name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Support Phone</label>
                                    <input className="form-input" type="text" value={profile.phone_number} onChange={e => setProfile({ ...profile, phone_number: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary mt-6" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Profile</>}
                            </button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="settings-form animate-fade-in">
                            <div className="panel-header mb-6">
                                <div className="header-icon"><Lock size={18} className="text-primary" /></div>
                                <h3>Security Settings</h3>
                            </div>

                            <div className="form-group">
                                <label>Current Password</label>
                                <input className="form-input" type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>New Secure Password</label>
                                <input className="form-input" type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input className="form-input" type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn-primary mt-6" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Lock size={18} /> Update Password</>}
                            </button>
                        </form>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-form animate-fade-in">
                            <div className="panel-header mb-6">
                                <div className="header-icon"><Bell size={18} className="text-primary" /></div>
                                <h3>Automation & Alerts</h3>
                            </div>

                            <div className="toggle-card">
                                <div className="toggle-info">
                                    <h4>Inventory Warnings</h4>
                                    <p>Get email alerts when stock levels fall below threshold.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={notifications.notify_stock} onChange={() => setNotifications({ ...notifications, notify_stock: !notifications.notify_stock })} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className="toggle-card">
                                <div className="toggle-info">
                                    <h4>Daily Sales Summary</h4>
                                    <p>Receive a PDF report of total revenue every 24 hours.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={notifications.notify_sales} onChange={() => setNotifications({ ...notifications, notify_sales: !notifications.notify_sales })} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <button className="btn-primary mt-8" onClick={handleSaveNotifications} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Preferences</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;