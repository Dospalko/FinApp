import apiClient from './axiosConfig';

export const getIncomes = async () => {
  try {
    const response = await apiClient.get('/incomes');
    return response.data;
  } catch (error) { console.error("API: getIncomes failed:", error.response?.data || error.message); throw error; }
};

export const addIncome = async (incomeData) => {
  try {
    const response = await apiClient.post('/incomes', incomeData);
    return response.data;
  } catch (error) { console.error("API: addIncome failed:", error.response?.data || error.message); throw error; }
};

export const deleteIncome = async (incomeId) => {
  try {
    const response = await apiClient.delete(`/incomes/${incomeId}`);
    return response.status;
  } catch (error) { console.error("API: deleteIncome failed:", error.response?.data || error.message); throw error; }
};

export const updateIncome = async (incomeId, incomeData) => {
    try {
        const response = await apiClient.put(`/incomes/${incomeId}`, incomeData);
        return response.data;
    } catch (error) { console.error("API: updateIncome failed:", error.response?.data || error.message); throw error; }
};