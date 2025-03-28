// frontend/src/api/expenseApi.js
import axios from 'axios';

// Načítanie URL z environment premenných Vite (ak sú definované v .env)
// V .env súbore v 'frontend/' priečinku môžeš mať: VITE_API_BASE_URL=http://127.0.0.1:5000
// V kóde potom process.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

console.log("Using API Base URL:", API_BASE_URL); // Pre kontrolu

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Môžeme pridať timeout
  // timeout: 5000,
});

export const getExpenses = async () => {
  try {
    const response = await apiClient.get('/expenses');
    return response.data;
  } catch (error) {
    console.error("API Error fetching expenses:", error.response?.data || error.message);
    throw error; // Posielame ďalej na spracovanie v komponente
  }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    console.error("API Error adding expense:", error.response?.data || error.message);
    throw error;
  }
};

export const pingBackend = async () => {
    try {
        // Voláme teraz /api/ping, keďže sme ho presunuli do expense_bp
        const response = await apiClient.get('/ping');
        return response.data;
    } catch (error) {
        // Logujeme detailnejšie
        console.error("API Error pinging backend:", error.response?.status, error.response?.data || error.message);
        throw error;
    }
};
export const deleteExpense = async (expenseId) => {
    try {
      // Pošli DELETE request na /expenses/{expenseId}
      const response = await apiClient.delete(`/expenses/${expenseId}`);
      // DELETE zvyčajne vracia status 204 No Content, response.data môže byť prázdne
      return response.status; // Vrátime status kód pre kontrolu
    } catch (error) {
      console.error(`API Error deleting expense ID ${expenseId}:`, error.response?.data || error.message);
      throw error; // Posielame ďalej na spracovanie
    }
  };
// TODO: Neskôr pridať deleteExpense, updateExpense