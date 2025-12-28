import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:5555/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save the JWT token to browser storage
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                alert('Login Successful!');
                // TO-DO: Redirect to Dashboard later
                // navigate('/dashboard'); 
            } else {
                setError(data.msg || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Is the Flask backend running?');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                {error && <p className="error-msg">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary">Login</button>
                </form>
                <p>
                    New to RadaPOS? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;