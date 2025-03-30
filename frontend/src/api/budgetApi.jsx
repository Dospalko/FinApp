// src/api/budgetApi.js
import axios from 'axios';

// Predpokladáme, že API_BASE_URL je definovaný podobne ako v ostatných API súboroch
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Získa rozpočty pre daný mesiac a rok.
 * @param {number} year Rok
 * @param {number} month Mesiac (1-12)
 * @returns {Promise<Array>} Pole objektov rozpočtov
 */
export const getBudgets = async (year, month) => {
  try {
    const response = await apiClient.get('/budgets', { params: { year, month } });
    return response.data;
  } catch (error) {
    console.error(`API Error fetching budgets for ${month}/${year}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Nastaví alebo aktualizuje jeden rozpočet.
 * @param {object} budgetData Objekt s { category, amount, month, year }
 * @returns {Promise<object>} Uložený objekt rozpočtu
 */
export const setBudget = async (budgetData) => {
  try {
    // Backend endpoint /budgets s metódou POST spracuje vytvorenie aj update
    const response = await apiClient.post('/budgets', budgetData);
    return response.data;
  } catch (error) {
    console.error("API Error setting budget:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Získa stav čerpania rozpočtov pre daný mesiac a rok.
 * @param {number} year Rok
 * @param {number} month Mesiac (1-12)
 * @returns {Promise<Array>} Pole objektov so stavom čerpania
 */
export const getBudgetStatus = async (year, month) => {
  try {
    const response = await apiClient.get('/budget-status', { params: { year, month } });
    return response.data;
  } catch (error) {
    console.error(`API Error fetching budget status for ${month}/${year}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Získa stav plnenia pravidla 50/30/20 pre daný mesiac a rok.
 * @param {number} year Rok
 * @param {number} month Mesiac (1-12)
 * @returns {Promise<object>} Objekt so stavom pravidla 50/30/20
 */
export const getRuleStatus = async (year, month) => {
   try {
    const response = await apiClient.get('/budget-rules-status', { params: { year, month } });
    return response.data;
  } catch (error) {
    console.error(`API Error fetching 50/30/20 rule status for ${month}/${year}:`, error.response?.data || error.message);
    throw error;
  }
};