import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    User, Lock, Save, AlertCircle, CheckCircle, Shield,
    Loader2, Sun, Moon
} from 'lucide-react';
import '../../styles/Cashier/CashierManagement.css';
import '../../styles/Admin/AdminManagement.css';

const CashierSettings = () => {
    const { user } = useAuth();

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone_number: '',
        id_number: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passLoading, setPassLoading] = useState(false);
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                id_number: user.id_number || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg({ type: '', text: '' });

        try {
            const res = await api.put('/auth/profile', {
                name: profile.name,
                phone_number: profile.phone_number
            });

            const updatedUser = { ...user, ...res.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setProfileMsg({ type: 'success', text: 'Profile details updated successfully.' });
        } catch (error) {
            setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassMsg({ type: '', text: '' });

        if (passwords.new_password !== passwords.confirm_password) {
            setPassMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setPassLoading(true);
        try {
            await api.post('/auth/change-password', {
                current_password: passwords.current_password,
                new_password: passwords.new_password
            });
            setPassMsg({ type: 'success', text: 'Password changed successfully.' });
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setPassMsg({ type: 'error', text: error.response?.data?.msg || 'Failed to change password.' });
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="management-container">
            {/* Header */}
            <div className="management-header">
                <div>
                    <h1 className="page-title">Account Settings</h1>
                    <p className="page-subtitle">Manage your profile details and security preferences</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            <div className="settings-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* PROFILE CARD */}
                <div className="glass-panel">
                    <div className="panel-header mb-6">
                        <div className="header-icon"><User size={18} className="text-emerald" /></div>
                        <h3>Profile Information</h3>
                    </div>

                    {profileMsg.text && (
                        <div className={`alert-box ${profileMsg.type}`}>
                            {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {profileMsg.text}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="settings-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                className="form-input"
                                value={profile.phone_number}
                                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                placeholder="07..."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-input disabled"
                                value={profile.email}
                                disabled
                                title="Contact Admin to change email"
                            />
                            <p className="text-xs text-muted mt-1">Email cannot be changed manually.</p>
                        </div>

                        <div className="form-group">
                            <label>National ID</label>
                            <div className="input-with-icon">
                                <Shield size={16} className="input-icon right" style={{ left: 'auto', right: '12px' }} />
                                <input
                                    type="text"
                                    className="form-input disabled"
                                    value={profile.id_number}
                                    disabled
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary full-width mt-6" disabled={profileLoading}>
                            {profileLoading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Profile</>}
                        </button>
                    </form>
                </div>

                {/* SECURITY CARD */}
                <div className="glass-panel">
                    <div className="panel-header mb-6">
                        <div className="header-icon"><Lock size={18} className="text-indigo" /></div>
                        <h3>Security</h3>
                    </div>

                    {passMsg.text && (
                        <div className={`alert-box ${passMsg.type}`}>
                            {passMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {passMsg.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.current_password}
                                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.new_password}
                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwords.confirm_password}
                                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary full-width mt-6" disabled={passLoading}>
                            {passLoading ? <Loader2 className="animate-spin" size={18} /> : <><Lock size={18} /> Change Password</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CashierSettings;