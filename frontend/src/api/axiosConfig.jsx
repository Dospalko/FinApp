import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        // Pridaj token iba ak URL neobsahuje /auth/ (pre login/register)
        if (token && !config.url?.includes('/auth/')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized (401). Clearing token.");
            localStorage.removeItem('authToken');
            // Necháme AuthContext a routovanie riešiť presmerovanie
            // window.location.href = '/login'; // Toto by spôsobilo full refresh
        }
        return Promise.reject(error);
    }
);

export default apiClient;