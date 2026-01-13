import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Lock, Key, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import '../../styles/Auth/ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setStatus('error');
            setErrorMsg("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            setStatus('error');
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        setStatus('loading');

        try {
            await api.post('/auth/reset-password', {
                email,
                token,
                new_password: passwords.newPassword
            });
            setStatus('success');
            setTimeout(() => {
                navigate('/login', { state: { role: 'cashier' } });
            }, 3000);
        } catch (error) {
            setStatus('error');
            setErrorMsg(error.response?.data?.msg || "Failed to reset password");
        }
    };

    if (status === 'success') {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <div className="success-message">
                        <CheckCircle size={64} className="success-icon" style={{ margin: '0 auto' }} />
                        <h2 className="reset-title" style={{ marginTop: '1rem' }}>Password Set!</h2>
                        <p className="reset-subtitle">Your account is now ready.</p>
                        <Link to="/login" className="login-link">Go to Login</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="reset-header">
                    <div className="reset-icon-wrapper">
                        <Key size={32} />
                    </div>
                    <h1 className="reset-title">Set Password</h1>
                    <p className="reset-subtitle">Create a secure password for {email}</p>
                </div>

                <form onSubmit={handleSubmit} className="reset-form">
                    {status === 'error' && (
                        <div className="error-message">
                            <AlertCircle size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            {errorMsg}
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">New Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                required
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                required
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                        {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Set Password & Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;