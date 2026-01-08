import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav style={{
            background: 'white',
            padding: '15px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#4CAF50' }}>
                    RadaPOS
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link 
                        to="/vendor/dashboard" 
                        style={{
                            textDecoration: 'none',
                            color: isActive('/vendor/dashboard') ? '#4CAF50' : '#666',
                            fontWeight: isActive('/vendor/dashboard') ? '600' : '400',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            backgroundColor: isActive('/vendor/dashboard') ? '#f0f9f0' : 'transparent'
                        }}
                    >
                        Dashboard
                    </Link>
                    <Link 
                        to="/vendor/inventory" 
                        style={{
                            textDecoration: 'none',
                            color: isActive('/vendor/inventory') ? '#4CAF50' : '#666',
                            fontWeight: isActive('/vendor/inventory') ? '600' : '400',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            backgroundColor: isActive('/vendor/inventory') ? '#f0f9f0' : 'transparent'
                        }}
                    >
                        Inventory
                    </Link>
                    <Link 
                        to="/vendor/staff" 
                        style={{
                            textDecoration: 'none',
                            color: isActive('/vendor/staff') ? '#4CAF50' : '#666',
                            fontWeight: isActive('/vendor/staff') ? '600' : '400',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            backgroundColor: isActive('/vendor/staff') ? '#f0f9f0' : 'transparent'
                        }}
                    >
                        Staff
                    </Link>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        background: '#4CAF50',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'V'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '500' }}>{user.name || 'Vendor'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.role || 'Vendor'}</div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        color: '#333',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;