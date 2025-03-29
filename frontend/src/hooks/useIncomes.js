import { useState, useEffect, useCallback } from 'react';
import { getIncomes, addIncome, deleteIncome, updateIncome } from '../api/incomeApi';

export function useIncomes() {
    const [incomes, setIncomes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingIncome, setEditingIncome] = useState(null);
    // Stav pre processing presunieme do App.jsx, lebo môže byť zdieľaný

    const fetchIncomes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getIncomes();
            setIncomes(data);
        } catch (err) {
            setError(`Chyba pri načítaní príjmov: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncomes();
    }, [fetchIncomes]);

    const addIncomeHandler = useCallback(async (incomeData) => {
        // processing state sa nastaví v App.jsx
        await addIncome(incomeData);
        await fetchIncomes(); // Re-fetch po pridaní
        // Chyba sa spracuje v App.jsx a posunie do formulára
    }, [fetchIncomes]);

    const updateIncomeHandler = useCallback(async (incomeId, updatedData) => {
        // processing state sa nastaví v App.jsx
        const updatedIncome = await updateIncome(incomeId, updatedData);
        setIncomes(prevIncomes =>
            prevIncomes.map(inc => (inc.id === incomeId ? updatedIncome : inc))
        );
        setEditingIncome(null); // Ukonči edit mód v tomto hooku
        // Chyba sa spracuje v App.jsx a posunie do formulára
    }, []);

    const deleteIncomeHandler = useCallback(async (incomeIdToDelete) => {
        // processing state sa nastaví v App.jsx
        const status = await deleteIncome(incomeIdToDelete);
        if (status === 204) {
            setIncomes(prevIncomes => prevIncomes.filter(inc => inc.id !== incomeIdToDelete));
            if (editingIncome?.id === incomeIdToDelete) {
                setEditingIncome(null); // Zruš úpravu ak mažem upravovanú položku
            }
        } else {
            // Chyba sa spracuje v App.jsx
            throw new Error(`Nepodarilo sa vymazať príjem (status: ${status}).`);
        }
    }, [editingIncome]); // Závislosť na editingIncome pre kontrolu

    const startEditingIncome = useCallback((income) => {
        setEditingIncome(income);
        setError(null); // Vyčisti chyby pri začatí úpravy
        // Scroll riešime v App.jsx alebo priamo v komponente
    }, []);

    const cancelEditingIncome = useCallback(() => {
        setEditingIncome(null);
    }, []);

    return {
        incomes,
        isLoading,
        error,
        editingIncome,
        fetchIncomes, // Môžeme ju exportovať, ak ju chceme volať externe
        addIncomeHandler,
        updateIncomeHandler,
        deleteIncomeHandler,
        startEditingIncome,
        cancelEditingIncome,
        setError // Umožní App.jsx nastaviť chybu externe, ak treba
    };
}