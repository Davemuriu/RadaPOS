import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    User, Lock, Bell, Save, Shield, AlertTriangle, Loader2,
    Sun, Moon, CheckCircle, FileText, Activity, Tag, Plus, Trash2
} from 'lucide-react';
import '../../styles/Vendor/VendorManagement.css';
import '../../styles/Admin/AdminDashboard.css';

const VendorSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [auditLogs, setAuditLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const [discounts, setDiscounts] = useState([]);
    const [newCode, setNewCode] = useState({ code: '', percentage: '' });

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [profile, setProfile] = useState({ name: '', email: '', business_name: '', phone_number: '' });
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [notifications, setNotifications] = useState({ notify_stock: true, notify_sales: false, notify_email: true });

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
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'audit') {
            const fetchLogs = async () => {
                setLogsLoading(true);
                try {
                    const res = await api.get('/settings/audit-logs');
                    setAuditLogs(res.data);
                } catch (err) { setAuditLogs([]); }
                finally { setLogsLoading(false); }
            };
            fetchLogs();
        }
        if (activeTab === 'promotions') {
            const fetchDiscounts = async () => {
                try {
                    const res = await api.get('/settings/discounts');
                    setDiscounts(res.data);
                } catch (err) { console.error(err); }
            };
            fetchDiscounts();
        }
    }, [activeTab]);

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(null); setError(null);
        try {
            const res = await api.post('/settings/discounts', newCode);
            setDiscounts([res.data.code, ...discounts]);
            setNewCode({ code: '', percentage: '' });
            setMessage("Promo code created successfully!");
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to create code");
        } finally { setLoading(false); }
    };

    const handleDeleteDiscount = async (id) => {
        if (!window.confirm("Delete this code?")) return;
        try {
            await api.delete(`/settings/discounts/${id}`);
            setDiscounts(discounts.filter(d => d.id !== id));
        } catch (err) { alert("Failed to delete"); }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(null); setError(null);
        try { await api.put('/settings/profile', profile); setMessage("Profile updated!"); }
        catch (err) { setError("Failed to update."); } finally { setLoading(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) { setError("No match"); return; }
        setLoading(true); setMessage(null); setError(null);
        try {
            await api.put('/settings/security/password', { current_password: passwords.current_password, new_password: passwords.new_password });
            setMessage("Password updated!"); setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) { setError(err.response?.data?.msg || "Failed"); } finally { setLoading(false); }
    };

    const handleSaveNotifications = async () => {
        setLoading(true); setMessage(null);
        try { await api.put('/settings/notifications', notifications); setMessage("Saved!"); }
        catch (err) { setError("Failed"); } finally { setLoading(false); }
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <div>
                    <h1 className="page-title">System Settings</h1>
                    <p className="page-subtitle">Manage your business configuration</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            <div className="settings-layout">
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
                    {/* --- NEW TAB --- */}
                    <button className={`tab-btn ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => setActiveTab('promotions')}>
                        <Tag size={18} /> Promotions
                    </button>
                    <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                        <FileText size={18} /> Audit Logs
                    </button>
                </div>

                <div className="settings-content glass-panel">
                    {message && <div className="alert-box success"><CheckCircle size={16} /> {message}</div>}
                    {error && <div className="alert-box error"><AlertTriangle size={16} /> {error}</div>}

                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="settings-form animate-fade-in">
                            <div className="panel-header mb-6"><div className="header-icon"><User size={18} className="text-primary" /></div><h3>Personal Information</h3></div>
                            <div className="form-grid">
                                <div className="form-group"><label>Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
                                <div className="form-group"><label>Email</label><input className="form-input disabled" value={profile.email} disabled /></div>
                                <div className="form-group"><label>Business Name</label><input className="form-input" value={profile.business_name} onChange={e => setProfile({ ...profile, business_name: e.target.value })} /></div>
                                <div className="form-group"><label>Phone</label><input className="form-input" value={profile.phone_number} onChange={e => setProfile({ ...profile, phone_number: e.target.value })} /></div>
                            </div>
                            <button type="submit" className="btn-primary mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Save Profile"}</button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="settings-form animate-fade-in">
                            <div className="panel-header mb-6"><div className="header-icon"><Lock size={18} className="text-primary" /></div><h3>Security Settings</h3></div>
                            <div className="form-group"><label>Current Password</label><input className="form-input" type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} /></div>
                            <div className="form-group"><label>New Password</label><input className="form-input" type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} /></div>
                            <div className="form-group"><label>Confirm</label><input className="form-input" type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} /></div>
                            <button type="submit" className="btn-primary mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Update Password"}</button>
                        </form>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-form animate-fade-in">
                            <div className="panel-header mb-6"><div className="header-icon"><Bell size={18} className="text-primary" /></div><h3>Automation</h3></div>
                            <div className="toggle-card"><div className="toggle-info"><h4>Inventory Warnings</h4><p>Email on low stock.</p></div><label className="switch"><input type="checkbox" checked={notifications.notify_stock} onChange={() => setNotifications({ ...notifications, notify_stock: !notifications.notify_stock })} /><span className="slider round"></span></label></div>
                            <div className="toggle-card"><div className="toggle-info"><h4>Daily Reports</h4><p>Email daily sales.</p></div><label className="switch"><input type="checkbox" checked={notifications.notify_sales} onChange={() => setNotifications({ ...notifications, notify_sales: !notifications.notify_sales })} /><span className="slider round"></span></label></div>
                            <button className="btn-primary mt-8" onClick={handleSaveNotifications} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : "Save Preferences"}</button>
                        </div>
                    )}

                    {activeTab === 'promotions' && (
                        <div className="settings-form animate-fade-in">
                            <div className="panel-header mb-6">
                                <div className="header-icon"><Tag size={18} className="text-primary" /></div>
                                <h3>Discount Codes</h3>
                            </div>

                            <form onSubmit={handleCreateDiscount} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Code Name</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. SUMMER25"
                                        value={newCode.code}
                                        onChange={e => setNewCode({ ...newCode, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Percentage %</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        placeholder="10"
                                        value={newCode.percentage}
                                        onChange={e => setNewCode({ ...newCode, percentage: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ height: '42px' }}>
                                    <Plus size={18} /> Create
                                </button>
                            </form>

                            <div className="table-responsive">
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Discount</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {discounts.length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No active promotions</td></tr>
                                        ) : (
                                            discounts.map(d => (
                                                <tr key={d.id}>
                                                    <td style={{ fontWeight: 'bold' }}>{d.code}</td>
                                                    <td>{d.percentage}% Off</td>
                                                    <td><span className="status-badge completed">Active</span></td>
                                                    <td>
                                                        <button onClick={() => handleDeleteDiscount(d.id)} className="icon-btn" style={{ color: '#ef4444' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="settings-form animate-fade-in">
                            <div className="panel-header mb-6"><div className="header-icon"><FileText size={18} className="text-primary" /></div><h3>Audit Trail</h3></div>
                            {logsLoading ? <div style={{ display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div> : (
                                <div className="table-responsive">
                                    <table className="data-table" style={{ width: '100%' }}>
                                        <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
                                        <tbody>
                                            {auditLogs.map(l => (
                                                <tr key={l.id}>
                                                    <td>{l.timestamp}</td>
                                                    <td>{l.user} <span className="status-badge">{l.role}</span></td>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{l.action}</td>
                                                    <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{l.details}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;