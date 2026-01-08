import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('vendor@example.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login...');
            
            // Try to login
            const response = await api.post('/login', {
                email,
                password
            });

            console.log('Login response:', response.data);
            
            // ✅ Save token AND user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            console.log('Token saved:', response.data.token);
            console.log('User saved:', response.data.user);
            
            // Redirect to dashboard
            navigate('/vendor/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            console.error('Error details:', err.response?.data);
            
            // If login fails, try to register
            try {
                console.log('Trying registration...');
                const registerResponse = await api.post('/register', {
                    name: 'Vendor',
                    email,
                    password,
                    role: 'vendor'
                });

                console.log('Register response:', registerResponse.data);
                
                localStorage.setItem('token', registerResponse.data.token);
                localStorage.setItem('user', JSON.stringify(registerResponse.data.user));
                
                navigate('/vendor/dashboard');
            } catch (registerErr) {
                console.error('Register error:', registerErr);
                setError(registerErr.response?.data?.error || 'Login/Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.box}>
                <h1 style={styles.title}>Vendor Login</h1>
                <p style={styles.subtitle}>Use: vendor@example.com / password123</p>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div style={styles.debug}>
                    <button onClick={() => {
                        console.log('Token:', localStorage.getItem('token'));
                        console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
                    }}>
                        Debug Info
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
    },
    box: {
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
    },
    title: { textAlign: 'center', marginBottom: '10px', color: '#333' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' },
    error: {
        background: '#ffebee',
        color: '#d32f2f',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '16px'
    },
    button: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    debug: {
        marginTop: '20px',
        textAlign: 'center'
    }
};

export default Login;