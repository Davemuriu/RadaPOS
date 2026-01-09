import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

//  Add token to ALL requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request - Token exists:', !!token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization header added:', config.headers.Authorization.substring(0, 20) + '...');
        } else {
            console.warn('No token found for request');
        }
        
        // For FormData, let browser set Content-Type
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (config.data && typeof config.data === 'object') {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle responses
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        
        if (error.response?.status === 401) {
            console.log('Unauthorized - clearing token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        if (error.response?.status === 422) {
            console.log('Unprocessable Entity - token may be invalid');
        }
        
        return Promise.reject(error);
    }
);

export default api;