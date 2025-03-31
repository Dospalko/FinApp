import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://127.0.0.1:5000/api/auth';

const authApiClient = axios.create({ // Separátna inštancia bez interceptora
    baseURL: AUTH_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const loginUser = async (credentials) => {
    try {
        const response = await authApiClient.post('/login', credentials);
        return response.data;
    } catch (error) {
        console.error("API Error login:", error.response?.data || error.message);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await authApiClient.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error("API Error register:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchCurrentUser = async (token) => {
    if (!token) throw new Error("Token required for fetchCurrentUser");
    try {
        // Aj /me potrebuje token, ale voláme cez separátny axios
        const response = await axios.get(`${AUTH_API_URL}/me`, {
             baseURL: '', // Prepíšeme base URL pre tento špecifický request
             headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("API Error fetching current user:", error.response?.data || error.message);
        throw error;
    }
};