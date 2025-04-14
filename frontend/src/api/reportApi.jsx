// frontend/src/api/reportApi.js
import apiClient from './axiosConfig';

/**
 * Získa DUMMY dáta pre týždenný prehľad.
 */
export const getWeeklySnapshot = async () => {
    console.log("API: Calling getWeeklySnapshot (returning DUMMY data)");
    // Simulácia sieťového oneskorenia
    await new Promise(resolve => setTimeout(resolve, 600));

    // Vráť štruktúru dát, akú očakáva frontend komponenta
    // Môžeš meniť hodnoty pre testovanie rôznych scenárov
    return Promise.resolve({
        start_date_last_week: "2024-04-08", // Pondelok minulého týždňa (príklad)
        end_date_last_week: "2024-04-14",   // Nedeľa minulého týždňa (príklad)
        total_income_last_week: Math.random() * 500 + 200, // Náhodný príjem
        total_expenses_last_week: Math.random() * 400 + 50, // Náhodné výdavky
        net_flow_last_week: (Math.random() * 300) - 100, // Náhodný čistý tok (+/-)
        biggest_expense: {
            description: "Veľký nákup v Bille",
            amount: Math.random() * 50 + 40
        },
        top_spending_categories: [
            { category: "Potraviny", amount: Math.random() * 100 + 30 },
            { category: "Reštaurácie a Kaviarne", amount: Math.random() * 50 + 10 },
            { category: "Doprava", amount: Math.random() * 30 + 5 }
        ],
        current_focus: Math.random() > 0.5 ? "Šetriť na dovolenku!" : null // Náhodne zobrazí fokus
    });

    /*
    // Príklad, ak by backend zlyhal:
    return Promise.reject({
        response: {
            data: { message: "Simulovaná chyba servera pri načítaní prehľadu." }
        }
    });
    */
};

/**
 * Simuluje uloženie týždenného fokusu.
 * @param {object} focusData - Objekt obsahujúci fokus, napr. { focusText: "..." }
 */
export const setWeeklyFocus = async (focusData) => {
    console.log("API: Calling setWeeklyFocus with:", focusData, "(DUMMY save)");
    // Simulácia sieťového oneskorenia
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulácia úspechu
    return Promise.resolve({
        message: "Fokus bol úspešne uložený (simulácia)",
        // Backend by vrátil uložený objekt, tu simulujeme
        id: Math.floor(Math.random() * 1000),
        user_id: 1, // Príklad
        week_start_date: new Date().toISOString().split('T')[0], // Príklad
        focus_text: focusData.focusText,
        date_set: new Date().toISOString()
    });

    /*
    // Simulácia chyby:
    return Promise.reject({
        response: {
            data: { message: "Simulovaná chyba pri ukladaní fokusu." }
        }
    });
     */
};