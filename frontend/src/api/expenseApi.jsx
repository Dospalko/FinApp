// src/api/expenseApi.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Predpokladáme, že Flask beží na porte 5000

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funkcia na získanie všetkých výdavkov
export const getExpenses = async () => {
  try {
    const response = await apiClient.get('/expenses');
    return response.data; // Vráti priamo pole výdavkov
  } catch (error) {
    console.error("API Error fetching expenses:", error);
    // Môžeme vrátiť chybu alebo prázdne pole, záleží na preferencii
    throw error; // Necháme komponenty spracovať chybu
  }
};

// Funkcia na pridanie nového výdavku
export const addExpense = async (expenseData) => {
  // expenseData by mal byť objekt: { description: '...', amount: ..., category: '...' }
  try {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data; // Vráti novovytvorený výdavok z API
  } catch (error) {
    console.error("API Error adding expense:", error);
    // Ak API vráti validačné chyby, môžu byť v error.response.data
    throw error;
  }
};

// Funkcia na ping (ak ju ešte potrebujeme)
export const pingBackend = async () => {
    try {
        const response = await apiClient.get('/ping');
        return response.data;
    } catch (error) {
        console.error("API Error pinging backend:", error);
        throw error;
    }
};

// Sem môžeme neskôr pridať deleteExpense, updateExpense atď.