// frontend/src/App.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Import Komponentov
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
import CategoryFilter, { ALL_CATEGORIES_VALUE } from './components/CategoryFilter/CategoryFilter';
import ExpenseChart from './components/ExpenseChart/ExpenseChart';
import IncomeForm from './components/IncomeForm/IncomeForm'; // Nový import
import IncomeList from './components/IncomeList/IncomeList'; // Nový import

// Import API Funkcií (predpokladáme jeden súbor api.js)
import {
    getExpenses, addExpense, deleteExpense,
    getIncomes, addIncome, deleteIncome,
    pingBackend
} from './api/incomeApi'; // Uprav cestu podľa potreby

// --- Komponent SummaryCard ---
// (Presunutý sem pre jednoduchosť, môže byť aj v samostatnom súbore)
const SummaryCard = ({ title, amount, color, isLoading, isBalance = false }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 text-center">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        {isLoading ? (
            <div className="h-7 bg-slate-200 rounded animate-pulse w-3/4 mx-auto"></div>
        ) : (
            <p className={`text-2xl font-semibold ${color}`}>
                {isBalance && amount !== 0 && (amount > 0 ? '+' : '-')}
                {Math.abs(amount).toFixed(2)} €
            </p>
        )}
    </div>
);
// --- Koniec SummaryCard ---


function App() {
    // --- Stavy pre Výdavky ---
    const [expenses, setExpenses] = useState([]);
    const [isExpensesLoading, setIsExpensesLoading] = useState(true);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [expenseListError, setExpenseListError] = useState(null);
    const [deletingExpenseId, setDeletingExpenseId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);

    // --- Stavy pre Príjmy ---
    const [incomes, setIncomes] = useState([]);
    const [isIncomesLoading, setIsIncomesLoading] = useState(true);
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [incomeListError, setIncomeListError] = useState(null);
    const [deletingIncomeId, setDeletingIncomeId] = useState(null);

    // --- Ostatné Stavy ---
    const [pingMessage, setPingMessage] = useState("Testujem spojenie s backendom...");
    const [showPing, setShowPing] = useState(true);

    // --- Funkcie na Načítanie Dát ---
    const fetchExpenses = useCallback(async () => {
        setIsExpensesLoading(true);
        setExpenseListError(null);
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (err) {
            setExpenseListError(`Chyba pri načítaní výdavkov: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsExpensesLoading(false);
        }
    }, []);

    const fetchIncomes = useCallback(async () => {
        setIsIncomesLoading(true);
        setIncomeListError(null);
        try {
            const data = await getIncomes();
            setIncomes(data);
        } catch (err) {
            setIncomeListError(`Chyba pri načítaní príjmov: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsIncomesLoading(false);
        }
    }, []);

    // --- useEffect na Prvotné Načítanie ---
    useEffect(() => {
        pingBackend()
            .then(data => setPingMessage(data.message || "Backend je pripojený."))
            .catch(err => setPingMessage(`Backend nedostupný: ${err.response?.data?.error || err.message}`))
            .finally(() => {
                setTimeout(() => setShowPing(false), 5000);
            });

        // Paralelné načítanie výdavkov a príjmov
        Promise.all([fetchExpenses(), fetchIncomes()]);

    }, [fetchExpenses, fetchIncomes]); // Spustí sa len raz po montáži

    // --- Handlery pre Výdavky ---
    const handleExpenseAdd = async (expenseData) => {
        setIsAddingExpense(true);
        try {
            await addExpense(expenseData);
            await fetchExpenses(); // Znova načítaj výdavky
        } catch (error) {
            console.error("Failed to add expense:", error);
            throw error; // Posuň chybu do ExpenseForm
        } finally {
            setIsAddingExpense(false);
        }
    };

    const handleExpenseDelete = async (expenseIdToDelete) => {
        setDeletingExpenseId(expenseIdToDelete);
        setExpenseListError(null); // Zmena Error stavu
        try {
            const status = await deleteExpense(expenseIdToDelete);
            if (status === 204) {
                await fetchExpenses(); // Znova načítaj výdavky
                console.log(`Expense with ID ${expenseIdToDelete} deleted successfully.`);
            } else {
                setExpenseListError(`Nepodarilo sa vymazať výdavok (status: ${status}).`);
            }
        } catch (error) {
            console.error(`Failed to delete expense ID ${expenseIdToDelete}:`, error);
            setExpenseListError(`Chyba pri mazaní výdavku: ${error.response?.data?.error || error.message}`);
        } finally {
            setDeletingExpenseId(null);
        }
    };

    // --- Handlery pre Príjmy ---
    const handleIncomeAdd = async (incomeData) => {
        setIsAddingIncome(true);
        try {
            await addIncome(incomeData);
            await fetchIncomes(); // Znova načítaj príjmy
        } catch (error) {
            console.error("Failed to add income:", error);
            throw error; // Posuň chybu do IncomeForm
        } finally {
            setIsAddingIncome(false);
        }
    };

    const handleIncomeDelete = async (incomeIdToDelete) => {
        setDeletingIncomeId(incomeIdToDelete);
        setIncomeListError(null);
        try {
            const status = await deleteIncome(incomeIdToDelete);
            if (status === 204) {
                await fetchIncomes(); // Znova načítaj príjmy
                console.log(`Income with ID ${incomeIdToDelete} deleted successfully.`);
            } else {
                setIncomeListError(`Nepodarilo sa vymazať príjem (status: ${status}).`);
            }
        } catch (error) {
            console.error(`Failed to delete income ID ${incomeIdToDelete}:`, error);
            setIncomeListError(`Chyba pri mazaní príjmu: ${error.response?.data?.error || error.message}`);
        } finally {
            setDeletingIncomeId(null);
        }
    };

    // --- Logika Filtrovania Výdavkov ---
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

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    // --- Logika pre Graf Výdavkov ---
    const categoryChartData = useMemo(() => {
        const totals = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Nezaradené';
            totals[category] = (totals[category] || 0) + expense.amount;
        });
        const labels = Object.keys(totals);
        const data = Object.values(totals);
        const sortedIndices = labels.map((_, index) => index).sort((a, b) => data[b] - data[a]);
        return {
            labels: sortedIndices.map(index => labels[index]),
            data: sortedIndices.map(index => data[index])
        };
    }, [expenses]);

    // --- Výpočty pre Zostatok ---
    const totalIncome = useMemo(() =>
        incomes.reduce((sum, income) => sum + income.amount, 0),
    [incomes]);

    const totalExpenses = useMemo(() =>
        expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]);

    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);


    // --- JSX Renderovanie ---
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* --- Hlavička --- */}
                <header className="mb-8 pb-4 border-b border-slate-200">
                    <h1 className="text-3xl font-bold text-center text-slate-900">
                        Finance Expense Tracker
                    </h1>
                    {showPing && (
                        <p className={`text-center text-xs mt-2 p-1.5 rounded ${pingMessage.startsWith('Backend nedostupný') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {pingMessage}
                        </p>
                    )}
                </header>

                {/* --- Súhrnné Karty --- */}
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard title="Celkové Príjmy" amount={totalIncome} color="text-green-600" isLoading={isIncomesLoading} />
                    <SummaryCard title="Celkové Výdavky" amount={totalExpenses} color="text-red-600" isLoading={isExpensesLoading} />
                    <SummaryCard title="Zostatok" amount={balance} color={balance >= 0 ? 'text-blue-600' : 'text-red-600'} isLoading={isExpensesLoading || isIncomesLoading} isBalance={true} />
                </div>

                {/* --- Hlavný Obsah (2 stĺpce na väčších obrazovkách) --- */}
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* === Ľavý Stĺpec: Výdavky & Graf === */}
                    <div className="space-y-6">
                        {/* Graf Výdavkov */}
                        {/* Zobrazíme, len ak nie je loading a sú dáta */}
                        {!isExpensesLoading && categoryChartData.labels.length > 0 && (
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-slate-200">
                                <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                                <ExpenseChart chartData={categoryChartData} />
                            </div>
                        )}

                        {/* Formulár Výdavkov */}
                        <ExpenseForm onExpenseAdd={handleExpenseAdd} isAdding={isAddingExpense} />

                        {/* Filter a Zoznam Výdavkov */}
                        <div>
                            {/* Filter sa zobrazí, len ak sú dáta */}
                            {!isExpensesLoading && expenses.length > 0 && (
                                <div className="bg-white p-4 rounded-t-lg shadow-md border border-slate-200 border-b-0">
                                    <CategoryFilter
                                        categories={availableCategories}
                                        selectedCategory={selectedCategory}
                                        onCategoryChange={handleCategoryChange}
                                    />
                                </div>
                            )}
                            {/* Zoznam Výdavkov */}
                            <ExpenseList
                                expenses={filteredExpenses}
                                isLoading={isExpensesLoading}
                                error={expenseListError}
                                onDelete={handleExpenseDelete}
                                deletingExpenseId={deletingExpenseId}
                                filterVisible={!isExpensesLoading && expenses.length > 0}
                            />
                        </div>
                    </div> {/* Koniec ľavého stĺpca */}

                    {/* === Pravý Stĺpec: Príjmy === */}
                    <div className="space-y-6">
                        {/* Formulár Príjmov */}
                        <IncomeForm onIncomeAdd={handleIncomeAdd} isAdding={isAddingIncome} />

                        {/* Zoznam Príjmov */}
                        <IncomeList
                            incomes={incomes}
                            isLoading={isIncomesLoading}
                            error={incomeListError}
                            onDelete={handleIncomeDelete}
                            deletingIncomeId={deletingIncomeId}
                        />
                    </div> {/* Koniec pravého stĺpca */}

                </main> {/* Koniec hlavného obsahu */}

                {/* --- Pätička --- */}
                <footer className="text-center mt-12 text-xs text-slate-400">
                    Jednoduchý Expense Tracker © {new Date().getFullYear()}
                </footer>
            </div> {/* Koniec container */}
        </div> /* Koniec hlavného div */
    );
}

export default App;