// src/utils/dateUtils.js

// Funkcia na formátovanie dátumu pre zobrazenie (napr. DD.MM.YYYY)
export const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-'; // Ak dátum chýba
    try {
        const date = new Date(dateString);
        // Skontroluj, či je dátum platný
        if (isNaN(date.getTime())) {
            console.warn("Invalid date string received:", dateString);
            return 'Neplatný dátum';
        }
        // Formátovanie na slovenský formát DD.MM.YYYY
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('sk-SK', options);
    } catch (e) {
        console.error("Error formatting date for display:", e);
        return 'Chyba dátumu'; // Vráť chybovú správu
    }
};