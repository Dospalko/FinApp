// src/api/incomeApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// Môžeš použiť rovnaký apiClient alebo si vytvoriť nový, ak treba
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- API funkcie LEN pre Príjmy ---
export const getIncomes = async () => {
  try {
    const response = await apiClient.get('/incomes'); // <-- Správny endpoint pre príjmy
    return response.data;
  } catch (error) {
    console.error("API Error fetching incomes:", error.response?.data || error.message);
    throw error;
  }
};

export const addIncome = async (incomeData) => {
  try {
    const response = await apiClient.post('/incomes', incomeData); // <-- Správny endpoint
    return response.data;
  } catch (error) {
    console.error("API Error adding income:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteIncome = async (incomeId) => {
  try {
    const response = await apiClient.delete(`/incomes/${incomeId}`); // <-- Správny endpoint
    return response.status; // Očakávame 204
  } catch (error) {
    console.error(`API Error deleting income ID ${incomeId}:`, error.response?.data || error.message);
    throw error;
  }
};

// TODO: Neskôr pridať updateIncome