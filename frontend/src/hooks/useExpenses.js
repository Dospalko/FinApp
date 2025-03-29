import { useState, useEffect, useCallback, useMemo } from 'react';
import { getExpenses, addExpense, deleteExpense, updateExpense } from '../api/expenseApi';
import { ALL_CATEGORIES_VALUE } from '../components/CategoryFilter/CategoryFilter'; // Import konštanty

export function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (err) {
            setError(`Chyba pri načítaní výdavkov: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpenseHandler = useCallback(async (expenseData) => {
        // processing state v App.jsx
        await addExpense(expenseData);
        await fetchExpenses();
    }, [fetchExpenses]);

    const updateExpenseHandler = useCallback(async (expenseId, updatedData) => {
        // processing state v App.jsx
        const updatedExpense = await updateExpense(expenseId, updatedData);
        setExpenses(prevExpenses =>
            prevExpenses.map(exp => (exp.id === expenseId ? updatedExpense : exp))
        );
        setEditingExpense(null);
    }, []);

    const deleteExpenseHandler = useCallback(async (expenseIdToDelete) => {
        // processing state v App.jsx
        const status = await deleteExpense(expenseIdToDelete);
        if (status === 204) {
            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseIdToDelete));
            if (editingExpense?.id === expenseIdToDelete) {
                setEditingExpense(null);
            }
        } else {
            throw new Error(`Nepodarilo sa vymazať výdavok (status: ${status}).`);
        }
    }, [editingExpense]);

    const startEditingExpense = useCallback((expense) => {
        setEditingExpense(expense);
        setError(null);
    }, []);

    const cancelEditingExpense = useCallback(() => {
        setEditingExpense(null);
    }, []);

    const handleCategoryChange = useCallback((category) => {
         setSelectedCategory(category);
    }, []);

    // --- Derived State ---
    const availableCategories = useMemo(() => {
        const categories = new Set(
            expenses
                .map(exp => exp.category)
                .filter(cat => cat && cat !== 'Nezaradené')
        );
        return Array.from(categories).sort();
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        if (selectedCategory === ALL_CATEGORIES_VALUE) {
            return expenses;
        }
        return expenses.filter(exp => exp.category === selectedCategory);
    }, [expenses, selectedCategory]);

     const categoryChartData = useMemo(() => {
        const totals = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Nezaradené';
            totals[category] = (totals[category] || 0) + expense.amount;
        });
        const labels = Object.keys(totals);
        const data = Object.values(totals);
        // Jednoduché zoradenie pre graf
        const sortedIndices = labels.map((_, index) => index).sort((a, b) => data[b] - data[a]);
        return {
            labels: sortedIndices.map(index => labels[index]),
            data: sortedIndices.map(index => data[index])
        };
    }, [expenses]);


    return {
        expenses,
        filteredExpenses, // Exportujeme filtrované pre list
        isLoading,
        error,
        editingExpense,
        selectedCategory,
        availableCategories,
        categoryChartData,
        fetchExpenses,
        addExpenseHandler,
        updateExpenseHandler,
        deleteExpenseHandler,
        startEditingExpense,
        cancelEditingExpense,
        handleCategoryChange,
        setError
    };
}