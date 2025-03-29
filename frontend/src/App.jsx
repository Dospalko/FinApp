import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
import CategoryFilter, { ALL_CATEGORIES_VALUE } from './components/CategoryFilter/CategoryFilter';
import ExpenseChart from './components/ExpenseChart/ExpenseChart';
import IncomeForm from './components/IncomeForm/IncomeForm';
import IncomeList from './components/IncomeList/IncomeList';

import {
  getExpenses, addExpense, deleteExpense, updateExpense, pingBackend
} from './api/expenseApi'; // Funkcie pre výdavky
import {
  getIncomes, addIncome, deleteIncome
} from './api/incomeApi'; // Funkcie pre príjmy


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

function App() {
    const [expenses, setExpenses] = useState([]);
    const [isExpensesLoading, setIsExpensesLoading] = useState(true);
    const [expenseListError, setExpenseListError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);
    const [editingExpense, setEditingExpense] = useState(null);

    const [incomes, setIncomes] = useState([]);
    const [isIncomesLoading, setIsIncomesLoading] = useState(true);
    const [incomeListError, setIncomeListError] = useState(null);

    const [pingMessage, setPingMessage] = useState("Testujem spojenie s backendom...");
    const [showPing, setShowPing] = useState(true);
    const [processingItem, setProcessingItem] = useState(null);

    const fetchExpenses = useCallback(async () => {
        setIsExpensesLoading(true);
        setExpenseListError(null);
        try { const data = await getExpenses(); setExpenses(data); }
        catch (err) { setExpenseListError(`Chyba pri načítaní výdavkov: ${err.response?.data?.error || err.message}`); }
        finally { setIsExpensesLoading(false); }
    }, []);

    const fetchIncomes = useCallback(async () => {
        setIsIncomesLoading(true);
        setIncomeListError(null);
        try { const data = await getIncomes(); setIncomes(data); }
        catch (err) { setIncomeListError(`Chyba pri načítaní príjmov: ${err.response?.data?.error || err.message}`); }
        finally { setIsIncomesLoading(false); }
    }, []);

    useEffect(() => {
        pingBackend()
            .then(data => setPingMessage(data.message || "Backend je pripojený."))
            .catch(err => setPingMessage(`Backend nedostupný: ${err.response?.data?.error || err.message}`))
            .finally(() => { setTimeout(() => setShowPing(false), 5000); });
        Promise.all([fetchExpenses(), fetchIncomes()]);
    }, [fetchExpenses, fetchIncomes]);

    const handleExpenseAdd = async (expenseData) => {
        setProcessingItem({ type: 'addExpense', id: null });
        try {
            await addExpense(expenseData);
            await fetchExpenses();
        } catch (error) {
            console.error("Failed to add expense:", error);
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleEditStart = (expenseToEdit) => {
        setEditingExpense(expenseToEdit);
        setExpenseListError(null);
        document.getElementById('expense-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleEditCancel = () => {
        setEditingExpense(null);
    };

    const handleExpenseUpdate = async (expenseId, updatedData) => {
        setProcessingItem({ type: 'updateExpense', id: expenseId });
        try {
            const updatedExpense = await updateExpense(expenseId, updatedData);
            setExpenses(prevExpenses =>
                prevExpenses.map(exp => (exp.id === expenseId ? updatedExpense : exp))
            );
            setEditingExpense(null);
        } catch (error) {
            console.error("Update expense failed in App:", error);
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleExpenseDelete = async (expenseIdToDelete) => {
        setProcessingItem({ type: 'deleteExpense', id: expenseIdToDelete });
        setExpenseListError(null);
        try {
            const status = await deleteExpense(expenseIdToDelete);
            if (status === 204) {
                setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseIdToDelete));
                 if (editingExpense?.id === expenseIdToDelete) {
                    setEditingExpense(null);
                }
            } else {
                setExpenseListError(`Nepodarilo sa vymazať výdavok (status: ${status}).`);
            }
        } catch (error) {
            console.error(`Failed to delete expense ID ${expenseIdToDelete}:`, error);
            setExpenseListError(`Chyba pri mazaní výdavku: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessingItem(null);
        }
    };

    const handleIncomeAdd = async (incomeData) => {
        setProcessingItem({ type: 'addIncome', id: null });
        try {
            await addIncome(incomeData);
            await fetchIncomes();
        } catch (error) {
            console.error("Failed to add income:", error);
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleIncomeDelete = async (incomeIdToDelete) => {
        setProcessingItem({ type: 'deleteIncome', id: incomeIdToDelete });
        setIncomeListError(null);
        try {
            const status = await deleteIncome(incomeIdToDelete);
            if (status === 204) {
                await fetchIncomes();
            } else {
                setIncomeListError(`Nepodarilo sa vymazať príjem (status: ${status}).`);
            }
        } catch (error) {
            console.error(`Failed to delete income ID ${incomeIdToDelete}:`, error);
            setIncomeListError(`Chyba pri mazaní príjmu: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessingItem(null);
        }
    };

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

    const totalIncome = useMemo(() => incomes.reduce((sum, income) => sum + income.amount, 0), [incomes]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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

                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard title="Celkové Príjmy" amount={totalIncome} color="text-green-600" isLoading={isIncomesLoading} />
                    <SummaryCard title="Celkové Výdavky" amount={totalExpenses} color="text-red-600" isLoading={isExpensesLoading} />
                    <SummaryCard title="Zostatok" amount={balance} color={balance >= 0 ? 'text-blue-600' : 'text-red-600'} isLoading={isExpensesLoading || isIncomesLoading} isBalance={true} />
                </div>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    <div className="space-y-6">
                        {!isExpensesLoading && categoryChartData.labels.length > 0 && (
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-slate-200">
                                <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                                <ExpenseChart chartData={categoryChartData} />
                            </div>
                        )}

                        <div id="expense-form-section">
                            <ExpenseForm
                                key={editingExpense ? `edit-${editingExpense.id}` : 'add'}
                                formMode={editingExpense ? 'edit' : 'add'}
                                initialData={editingExpense}
                                onExpenseAdd={handleExpenseAdd}
                                onExpenseUpdate={handleExpenseUpdate}
                                isProcessing={
                                    processingItem?.type === 'addExpense' ||
                                    (processingItem?.type === 'updateExpense' && processingItem?.id === editingExpense?.id)
                                }
                                onCancelEdit={handleEditCancel}
                            />
                        </div>

                        <div>
                            {!isExpensesLoading && expenses.length > 0 && (
                                <div className="bg-white p-4 rounded-t-lg shadow-md border border-slate-200 border-b-0">
                                    <CategoryFilter
                                        categories={availableCategories}
                                        selectedCategory={selectedCategory}
                                        onCategoryChange={handleCategoryChange}
                                    />
                                </div>
                            )}
                            <ExpenseList
                                expenses={filteredExpenses}
                                isLoading={isExpensesLoading}
                                error={expenseListError}
                                onDelete={handleExpenseDelete}
                                onEdit={handleEditStart}
                                processingItem={processingItem}
                                filterVisible={!isExpensesLoading && expenses.length > 0}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <IncomeForm
                            onIncomeAdd={handleIncomeAdd}
                            isAdding={processingItem?.type === 'addIncome'}
                        />
                        <IncomeList
                            incomes={incomes}
                            isLoading={isIncomesLoading}
                            error={incomeListError}
                            onDelete={handleIncomeDelete}
                            deletingIncomeId={processingItem?.type === 'deleteIncome' ? processingItem.id : null}
                        />
                    </div>

                </main>

                <footer className="text-center mt-12 text-xs text-slate-400">
                    Jednoduchý Expense Tracker © {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
}

export default App;