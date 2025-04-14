import apiClient from './axiosConfig';

// Získa rozpočty pre daný mesiac/rok
export const getBudgets = async (year, month) => {
  try {
    const response = await apiClient.get('api/budgets', { params: { year, month } });
    return response.data;
  } catch (error) { console.error("API: getBudgets failed:", error.response?.data || error.message); throw error; }
};

// Nastaví alebo aktualizuje rozpočet pre kategóriu/mesiac/rok
export const setBudget = async (budgetData) => {
  // budgetData = { category: '...', amount: ..., month: ..., year: ... }
  try {
    const response = await apiClient.post('api/budgets', budgetData);
    return response.data;
  } catch (error) { console.error("API: setBudget failed:", error.response?.data || error.message); throw error; }
};

// Získa stav čerpania rozpočtov
export const getBudgetStatus = async (year, month) => {
  try {
    const response = await apiClient.get('api/budget-status', { params: { year, month } });
    return response.data;
  } catch (error) { console.error("API: getBudgetStatus failed:", error.response?.data || error.message); throw error; }
};

// Získa stav pravidla 50/30/20
export const getRuleStatus = async (year, month) => {
    try {
      const response = await apiClient.get('api/budget-rules-status', { params: { year, month } });
      return response.data;
    } catch (error) { console.error("API: getBudgetRulesStatus failed:", error.response?.data || error.message); throw error; }
  };