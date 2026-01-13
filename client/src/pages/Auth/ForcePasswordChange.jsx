import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import '../../styles/Auth/LoginPage.css';

const ForcePasswordChange = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const tempToken = localStorage.getItem('temp_auth_token');
        if (!tempToken) {
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Security requirement: Password must be at least 8 characters.");
            return;
        }

        if (newPassword === currentPassword) {
            setError("New password cannot be the same as the temporary password.");
            return;
        }

        setIsLoading(true);

        try {
            const tempToken = localStorage.getItem('temp_auth_token');

            // Use 'api' instance but override auth header for temp token
            await api.post('/auth/change-password',
                {
                    current_password: currentPassword.trim(),
                    new_password: newPassword.trim()
                },
                {
                    headers: { Authorization: `Bearer ${tempToken}` }
                }
            );

            localStorage.removeItem('temp_auth_token');
            alert("Security update successful! Please sign in with your new credentials.");
            navigate('/login');

        } catch (err) {
            console.error("Change Password Error:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('temp_auth_token');
                setError("Session expired. Please start over.");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.response?.data?.msg || "Failed to update password. Verify current password.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-glow security"></div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="role-badge security">
                        <ShieldCheck size={20} />
                        <span>Security Update</span>
                    </div>
                    <h1>Change Password</h1>
                    <p>You must replace your temporary password to secure your account.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Current Temporary Password</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box"><Lock size={18} /></div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Paste from email"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Create New Password</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box"><Lock size={18} /></div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="input-icon-wrapper">
                            <div className="icon-box"><Lock size={18} /></div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-type new password"
                                required
                            />
                        </div>
                    </div>
                    <div
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPassword ? "Hide Passwords" : "Show Passwords"}
                    </div>
                    <button
                        type="submit"
                        className="auth-btn security"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader2 className="animate-spin" size={20} /> Securing Account...</>
                        ) : (
                            "Update Password & Continue"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChange;