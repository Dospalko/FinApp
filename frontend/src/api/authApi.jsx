import axios from 'axios';
import apiClient from './axiosConfig'; // Importuj apiClient pre volania vyžadujúce token

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://127.0.0.1:5000/api/auth';

const authApiClient = axios.create({
    baseURL: AUTH_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const loginUser = async (credentials) => {
    try {
        const response = await authApiClient.post('/login', credentials);
        return response.data;
    } catch (error) { console.error("API Error login:", error.response?.data || error.message); throw error; }
};

export const registerUser = async (userData) => {
    try {
        const response = await authApiClient.post('/register', userData);
        return response.data;
    } catch (error) { console.error("API Error register:", error.response?.data || error.message); throw error; }
};

export const fetchCurrentUser = async (token) => {
    if (!token) throw new Error("Token required for fetchCurrentUser");
    try {
        // Načítanie /me cez authApiClient ale s tokenom
        const response = await axios.get(`${AUTH_API_URL}/me`, {
             baseURL: '',
             headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) { console.error("API Error fetching current user:", error.response?.data || error.message); throw error; }
};

// --- Nová Funkcia ---
export const changePassword = async (passwordData) => {
    // passwordData = { currentPassword: '...', newPassword: '...', confirmNewPassword: '...' }
    try {
        // Použi apiClient, lebo táto operácia vyžaduje byť prihlásený (token)
        const response = await apiClient.put(`/auth/change-password`, passwordData); // Cesta je relatívna k baseURL apiClientu
        return response.data; // Vráti {"message": "..."}
    } catch (error) {
        console.error("API Error changing password:", error.response?.data || error.message);
        throw error;
    }
};