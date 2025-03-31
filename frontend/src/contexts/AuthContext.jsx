import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi';
import apiClient from '../api/axiosConfig'; // Importuj apiClient pre nastavenie defaultov

const AuthContext = createContext(null);

const getTokenFromStorage = () => localStorage.getItem('authToken');
const setTokenInStorage = (token) => localStorage.setItem('authToken', token);
const removeTokenFromStorage = () => localStorage.removeItem('authToken');

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getTokenFromStorage());
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Funkcia na aktualizáciu stavu a localStorage
    const updateAuthState = (newToken, newUser) => {
        if (newToken) {
            setTokenInStorage(newToken);
            setToken(newToken);
            // Nastav token ako default hlavičku pre apiClient (aj keď interceptor to robí)
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            removeTokenFromStorage();
            setToken(null);
            delete apiClient.defaults.headers.common['Authorization'];
        }
        setUser(newUser);
        setAuthError(null); // Vymaž staré chyby pri zmene stavu
    };

    const loadUser = useCallback(async () => {
        const currentToken = getTokenFromStorage();
        if (!currentToken) {
            updateAuthState(null, null); setIsLoading(false); return;
        }
        setIsLoading(true);
        try {
            const userData = await fetchCurrentUser(currentToken);
            updateAuthState(currentToken, userData);
        } catch (error) {
            console.error("Failed to load user (token invalid/expired):", error);
            updateAuthState(null, null); // Vymaž neplatný token a usera
            // Nezobrazuj chybu pri neúspešnom auto-logine
            // setAuthError("Session expired or invalid.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    const login = async (credentials) => {
        setIsLoading(true); setAuthError(null);
        try {
            const data = await loginUser(credentials);
            updateAuthState(data.access_token, data.user);
            return true;
        } catch (error) {
            updateAuthState(null, null);
            setAuthError(error.response?.data?.message || "Login failed.");
            return false;
        } finally { setIsLoading(false); }
    };

    const register = async (userData) => {
         setIsLoading(true); setAuthError(null);
         try {
             const data = await registerUser(userData);
             // Po registrácii nás backend rovno prihlási a vráti token
             updateAuthState(data.access_token, null); // Token máme, usera načítame
             await loadUser(); // Načítaj user dáta
             return true;
         } catch (error) {
             updateAuthState(null, null);
             setAuthError(error.response?.data?.message || "Registration failed.");
             return false;
         } finally { setIsLoading(false); }
    };

    const logout = useCallback(() => {
        updateAuthState(null, null);
        console.log("User logged out");
    }, []);

    const value = { token, user, isAuthenticated: !!user, isLoading, authError, login, register, logout };

    // Zobrazíme deti až keď sa dokončí prvotné načítavanie
    return <AuthContext.Provider value={value}>{!isLoading ? children : <div className="flex justify-center items-center h-screen">Načítavam aplikáciu...</div>}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) { throw new Error('useAuth must be used within AuthProvider'); }
    return context;
};