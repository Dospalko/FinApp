// frontend/src/api/budgetApi.js
import apiClient from './axiosConfig';

// POST /api/budgets - Pre upsert rozpočtu (cez slider)
export const setBudget = async (budgetData) => {
    // budgetData = { category: "...", amount: 120.00, month: 5, year: 2024 }
    try {
        const response = await apiClient.post('/budgets', budgetData);
        return response.data;
    } catch (error) {
        console.error("API Error setting budget:", error.response?.data || error.message);
        throw error;
    }
};

// GET /api/budgets/status?year=YYYY&month=MM
export const getBudgetStatus = async (year, month) => {
    try {
        const response = await apiClient.get('/budgets/status', { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error("API Error fetching budget status:", error.response?.data || error.message);
        throw error;
    }
};

// GET /api/budgets/rules-status?year=YYYY&month=MM
export const getRuleStatus = async (year, month) => {
     try {
        const response = await apiClient.get('/budgets/rules-status', { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error("API Error fetching rule status:", error.response?.data || error.message);
        throw error;
    }
};

// GET /api/budgets?year=YYYY&month=MM (Ak by si ho ešte niekde potreboval)
export const getBudgets = async (year, month) => {
     try {
        const response = await apiClient.get('/budgets', { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error("API Error fetching budgets:", error.response?.data || error.message);
        throw error;
    }
};