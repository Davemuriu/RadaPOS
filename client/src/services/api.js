import axios from 'axios';

const api = axios.create({

    baseURL: 'http://localhost:5555/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check for temp_auth_token to avoid kicking users off ForcePasswordChange
            const isChangingPassword = window.location.pathname === '/force-password-change';

            if (!isChangingPassword && window.location.pathname !== '/login' && window.location.pathname !== '/') {
                console.warn("Session expired. Logging out...");
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;