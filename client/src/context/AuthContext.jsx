import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('access_token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) {
                    console.error("Auth Parse Error", e);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkLoginStatus();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);