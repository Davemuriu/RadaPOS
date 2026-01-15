import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';
const api = axios.create({ baseURL: BASE_URL });

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

export const directPayout = (data) => api.post('/auth/payout-direct', data);
export const getWallet = () => api.get('/vendor/wallet');

export default api;