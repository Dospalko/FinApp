// frontend/src/api/reportApi.js
import apiClient from './axiosConfig';

/**
 * Získa dáta pre týždenný prehľad z reálneho backendu.
 * Volá endpoint: GET /api/reports/weekly-snapshot
 */
export const getWeeklySnapshot = async () => {
  console.log("API: Calling getWeeklySnapshot from real backend");
  try {
    // Posielame GET na /api/reports/weekly-snapshot
    // => vo výsledku http://127.0.0.1:5000/api/reports/weekly-snapshot
    const response = await apiClient.get('api/reports/weekly-snapshot');
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly snapshot:", error);
    throw error;
  }
};

/**
 * Uloží týždenný fokus do reálnej DB cez backend.
 * Volá endpoint: POST /api/reports/weekly-focus
 * @param {object} focusData - napr. { focusText: "Týždenný cieľ" }
 */
export const setWeeklyFocus = async (focusData) => {
  console.log("API: Calling setWeeklyFocus with:", focusData);
  try {
    // Posielame POST na /api/reports/weekly-focus
    // => vo výsledku http://127.0.0.1:5000/api/reports/weekly-focus
    const response = await apiClient.post('api/reports/weekly-focus', {
      focusText: focusData.focusText,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting weekly focus:", error);
    throw error;
  }
};
