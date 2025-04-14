import apiClient from './axiosConfig';

export const getExpenses = async () => {
  try {
    const response = await apiClient.get('api/expenses');
    return response.data;
  } catch (error) { console.error("API: getExpenses failed:", error.response?.data || error.message); throw error; }
};

export const addExpense = async (expenseData) => {
  try {
    const response = await apiClient.post('api/expenses', expenseData);
    return response.data;
  } catch (error) { console.error("API: addExpense failed:", error.response?.data || error.message); throw error; }
};

export const deleteExpense = async (expenseId) => {
  try {
    const response = await apiClient.delete(`api/expenses/${expenseId}`);
    return response.status;
  } catch (error) { console.error("API: deleteExpense failed:", error.response?.data || error.message); throw error; }
};

export const updateExpense = async (expenseId, expenseData) => {
    try {
        const response = await apiClient.put(`api/expenses/${expenseId}`, expenseData);
        return response.data;
    } catch (error) { console.error("API: updateExpense failed:", error.response?.data || error.message); throw error; }
};

export const pingApi = async () => {
    try {
        const response = await apiClient.get('api/ping');
        return response.data;
    } catch (error) { console.error("API: pingApi failed:", error.response?.status, error.response?.data || error.message); throw error; }
};