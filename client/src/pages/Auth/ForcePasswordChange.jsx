import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Loader2, AlertCircle, Key, CheckCircle } from 'lucide-react';
import '../../styles/Auth/LoginPage.css';

const ForcePasswordChange = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [mode, setMode] = useState(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (localStorage.getItem('temp_auth_token')) {
            setMode('FORCE_FLOW');
            if (location.state?.email) setEmail(location.state.email);
        }
        else if (location.state?.email) {
            setMode('RESET_FLOW');
            setEmail(location.state.email);
        }

        else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'RESET_FLOW') {
                if (!resetToken) throw new Error("Reset token is required.");

                await api.post('/auth/reset-password', {
                    email: email,
                    token: resetToken.trim(),
                    new_password: password
                });

                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);

            } else if (mode === 'FORCE_FLOW') {
                const tempToken = localStorage.getItem('temp_auth_token');
                const config = { headers: { Authorization: `Bearer ${tempToken}` } };

                await api.post('/auth/change-password', {
                    current_password: "FORCE_OVERRIDE",
                    new_password: password
                }, config);

                localStorage.removeItem('temp_auth_token');
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || err.message || "Failed to update password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mode) return null;

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="role-badge" style={{ color: '#f59e0b', borderColor: '#f59e0b' }}>
                        <Lock size={16} />
                        <span>Security Update</span>
                    </div>
                    <h1>{mode === 'RESET_FLOW' ? 'Reset Password' : 'Change Password'}</h1>
                    <p>
                        {mode === 'RESET_FLOW'
                            ? `Enter the token sent to ${email}`
                            : 'You must update your password to continue.'}
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-green-700">Success!</h3>
                        <p className="text-gray-500 mt-2">Password updated. Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="auth-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        {mode === 'RESET_FLOW' && (
                            <div className="form-group">
                                <label>Reset Token</label>
                                <div className="input-icon-wrapper">
                                    <div className="icon-box"><Key size={18} /></div>
                                    <input
                                        type="text"
                                        value={resetToken}
                                        onChange={(e) => setResetToken(e.target.value)}
                                        placeholder="Paste token from email"
                                        className="font-mono"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-icon-wrapper">
                                <div className="icon-box"><Lock size={18} /></div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-icon-wrapper">
                                <div className="icon-box"><Lock size={18} /></div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForcePasswordChange;