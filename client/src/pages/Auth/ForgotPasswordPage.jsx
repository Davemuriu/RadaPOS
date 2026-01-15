import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
    Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle,
    LayoutDashboard, Store, ShoppingBag
} from 'lucide-react';
import '../../styles/Auth/LoginPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // --- THEME LOGIC (Matches LoginPage) ---
    // If user clicked "Forgot Password" from Login, we try to grab the role they were attempting to use
    // defaulting to 'vendor' if unknown.
    const contextRole = (location.state?.role || 'vendor').toLowerCase();

    const getRoleConfig = (role) => {
        switch (role) {
            case 'admin':
                return { title: 'Admin Recovery', icon: <LayoutDashboard size={24} />, color: '#f59e0b' };
            case 'cashier':
                return { title: 'Cashier Recovery', icon: <ShoppingBag size={24} />, color: '#3b82f6' };
            case 'vendor':
            default:
                return { title: 'Account Recovery', icon: <Store size={24} />, color: '#10b981' };
        }
    };

    const config = getRoleConfig(contextRole);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/forgot-password', { email });
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || "Failed to send code. Please check the email.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceed = () => {
        navigate('/force-password-change', {
            state: {
                email: email,
                message: "Code sent! Please enter the 6-digit code from your email."
            }
        });
    };

    return (
        <div className="auth-wrapper">
            {/* Themed Background Glow */}
            <div className="auth-glow" style={{ background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)` }}></div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="role-badge" style={{ color: config.color, borderColor: config.color }}>
                        {config.icon}
                        <span>{config.title}</span>
                    </div>
                    <h1>Forgot Password?</h1>
                    <p>Enter your email to receive a 6-digit reset code.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box"><Mail size={18} /></div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={isLoading} style={{ background: config.color }}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Get Reset Code"}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b', padding: '2rem', borderRadius: '16px',
                        width: '90%', maxWidth: '400px', textAlign: 'center',
                        border: '1px solid #334155', color: '#fff'
                    }}>
                        <div style={{ margin: '0 auto 1.5rem auto', color: '#22c55e' }}>
                            <CheckCircle size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Code Sent!</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            We sent a 6-digit code to <strong>{email}</strong>.
                        </p>
                        <button
                            onClick={handleProceed}
                            className="auth-btn"
                            style={{ background: '#22c55e', width: '100%', border: 'none', color: '#fff' }}
                        >
                            Enter Code & Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPasswordPage;