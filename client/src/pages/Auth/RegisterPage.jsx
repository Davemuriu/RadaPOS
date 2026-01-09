import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        business_name: '',
        role: 'vendor'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:5555/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created! Please login.');
                navigate('/login');
            } else {
                setError(data.msg || 'Registration failed');
            }
        } catch (err) {
            setError('Server error. Is the Flask backend running?');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Join RadaPOS</h2>
                {error && <p className="error-msg">{error}</p>}
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Full Name"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="business_name"
                        placeholder="Business Name (e.g. Joe's Burgers)"
                        value={formData.business_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="vendor">I am a Vendor (Business Owner)</option>
                        <option value="cashier">I am a Cashier (Employee)</option>
                    </select>
                    <button type="submit" className="btn-primary">Sign Up</button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;