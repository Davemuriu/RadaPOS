import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('access_token');
            const userData = localStorage.getItem('user_data');

            if (token && userData) {
                setUser(JSON.parse(userData));
            }
            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        navigate(`/${userData.role}`);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);