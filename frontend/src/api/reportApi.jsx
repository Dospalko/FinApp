// frontend/src/api/reportApi.js
import apiClient from './axiosConfig';

export const getWeeklySnapshot = async () => {
  console.log("API: Calling GET /api/reports/weekly-snapshot");
  try {
    const response = await apiClient.get('/api/reports/weekly-snapshot');
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly snapshot:", error.response?.data || error.message, error);
    // Vráť objekt s chybou, aby si ho mohol spracovať v komponente
    throw error.response?.data || new Error(error.message || 'Unknown error fetching weekly snapshot');
  }
};

export const setWeeklyFocus = async (focusData) => {
  console.log("API: Calling POST /api/reports/weekly-focus with:", focusData);
  try {
    // Backend očakáva objekt s kľúčom 'focusText' podľa schémy WeeklyFocusInputSchema
    // Ak focusData už má tento tvar (napr. { focusText: "..." }), je to OK.
    // Ak posielaš len string, treba ho zabaliť: { focusText: focusData }
    // Predpokladáme, že posielaš správny objekt:
    const response = await apiClient.post('/api/reports/weekly-focus', focusData);
    return response.data;
  } catch (error) {
    console.error("Error setting weekly focus:", error.response?.data || error.message, error);
    throw error.response?.data || new Error(error.message || 'Unknown error setting weekly focus');
  }
};