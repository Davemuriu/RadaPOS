import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Lock,
    Mail,
    Loader2,
    Store,
    ShoppingBag,
    LayoutDashboard,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import '../../styles/Auth/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const contextRole = (location.state?.role || 'vendor').toLowerCase();

    const getRoleConfig = (role) => {
        switch (role) {
            case 'admin':
                return { title: 'Admin Console', subtitle: 'System Owner Access', icon: <LayoutDashboard size={24} />, color: '#f59e0b' };
            case 'cashier':
                return { title: 'Cashier Terminal', subtitle: 'Point of Sale Access', icon: <ShoppingBag size={24} />, color: '#3b82f6' };
            case 'vendor':
            default:
                return { title: 'Vendor Portal', subtitle: 'Store Management Access', icon: <Store size={24} />, color: '#10b981' };
        }
    };

    const config = getRoleConfig(contextRole);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = { email: email.trim(), password: password.trim() };
            const res = await api.post('/auth/login', payload);
            const { access_token, user, must_change_password } = res.data;

            const userRole = user.role.toLowerCase();

            // Handle Forced Password Change
            if (must_change_password) {
                localStorage.setItem('temp_auth_token', access_token);
                navigate('/force-password-change', { state: { email: email.trim() } });
                return;
            }

            // Success Login
            login(user, access_token);

            switch (userRole) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'vendor':
                    navigate('/vendor/dashboard');
                    break;
                case 'cashier':
                    navigate('/cashier/dashboard');
                    break;
                default:
                    // Fallback for unknown roles
                    console.warn("Unknown role:", userRole);
                    navigate('/');
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || err.response?.data?.msg || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-glow" style={{ background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)` }}></div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="role-badge" style={{ color: config.color, borderColor: config.color }}>
                        {config.icon}
                        <span>{config.title}</span>
                    </div>
                    <h1>{config.title}</h1>
                    <p>{config.subtitle}</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="forgot-password">
                            <Link to="/forgot-password" style={{ color: config.color }}>Forgot Password?</Link>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" style={{ background: config.color }} disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;