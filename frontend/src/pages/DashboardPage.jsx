import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
// API Imports
import { getExpenses, addExpense, deleteExpense } from '../api/expenseApi';
import { getIncomes, addIncome, deleteIncome } from '../api/incomeApi';
// import { getBudgets, setBudget, getBudgetStatus, getBudgetRulesStatus } from '../api/budgetApi'; // Pripravené
// Component Imports
import ExpenseForm from '../components/Expense/ExpenseForm';
import ExpenseList from '../components/Expense/ExpenseList';
import IncomeForm from '../components/Income/IncomeForm';
import IncomeList from '../components/Income/IncomeList';
// import BudgetForm from '../components/Budget/BudgetForm'; // Pripravené
// import BudgetStatusList from '../components/Budget/BudgetStatusList'; // Pripravené
import Alert from '../components/UI/Alert';

const DashboardPage = () => {
    const { user } = useAuth();
    // Expense State
    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [addingExpense, setAddingExpense] = useState(false);
    const [expenseError, setExpenseError] = useState(null);
    const [deletingExpenseId, setDeletingExpenseId] = useState(null);
    // Income State
    const [incomes, setIncomes] = useState([]);
    const [loadingIncomes, setLoadingIncomes] = useState(true);
    const [addingIncome, setAddingIncome] = useState(false);
    const [incomeError, setIncomeError] = useState(null);
    const [deletingIncomeId, setDeletingIncomeId] = useState(null);
    // TODO: Budget State

    // --- Fetching Logic ---
    const fetchData = useCallback(async () => {
        if (!user) return;
        // Paralelne načítanie dát
        setLoadingExpenses(true); setLoadingIncomes(true);
        setExpenseError(null); setIncomeError(null);
        try {
            const [expenseData, incomeData] = await Promise.all([
                getExpenses(),
                getIncomes(),
                // getBudgets(year, month), // Pridať načítanie budgetov
                // getBudgetStatus(year, month), // Pridať načítanie statusu
            ]);
            setExpenses(expenseData);
            setIncomes(incomeData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            // Nastav všeobecnú chybu alebo špecifické pre každú sekciu
            setExpenseError("Chyba pri načítaní dát.");
            setIncomeError("Chyba pri načítaní dát.");
        } finally {
            setLoadingExpenses(false); setLoadingIncomes(false);
        }
    }, [user]); // Závisí na userovi

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Expense Handlers ---
    const handleExpenseAdd = async (data) => { setAddingExpense(true); try { await addExpense(data); await fetchData(); } catch (e) { throw e; } finally { setAddingExpense(false); }};
    const handleExpenseDelete = async (id) => { setDeletingExpenseId(id); try { if (await deleteExpense(id) === 204) { setExpenses(prev => prev.filter(e => e.id !== id)); } } catch (e) { setExpenseError(e.message); } finally { setDeletingExpenseId(null); }};

    // --- Income Handlers ---
    const handleIncomeAdd = async (data) => { setAddingIncome(true); try { await addIncome(data); await fetchData(); } catch (e) { throw e; } finally { setAddingIncome(false); }};
    const handleIncomeDelete = async (id) => { setDeletingIncomeId(id); try { if (await deleteIncome(id) === 204) { setIncomes(prev => prev.filter(i => i.id !== id)); } } catch (e) { setIncomeError(e.message); } finally { setDeletingIncomeId(null); }};

    // TODO: Budget Handlers

    return (
        <div className="space-y-8">
             {/* Súhrn alebo pravidlá - TODO */}
             {/* <div className="bg-white p-4 rounded-lg shadow"> ... 50/30/20 status ... </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stĺpec pre Výdavky */}
                <section>
                    <ExpenseForm onExpenseAdd={handleExpenseAdd} isAdding={addingExpense} />
                    <ExpenseList
                        expenses={expenses}
                        isLoading={loadingExpenses}
                        error={expenseError}
                        onDelete={handleExpenseDelete}
                        deletingExpenseId={deletingExpenseId}
                    />
                </section>

                {/* Stĺpec pre Príjmy */}
                <section>
                    <IncomeForm onIncomeAdd={handleIncomeAdd} isAdding={addingIncome} />
                    <IncomeList
                         incomes={incomes}
                         isLoading={loadingIncomes}
                         error={incomeError}
                         onDelete={handleIncomeDelete}
                         deletingIncomeId={deletingIncomeId}
                     />
                </section>
            </div>

             {/* Sekcia pre Rozpočty - TODO */}
             {/* <section className="mt-8">
                 <h2 className="text-xl font-semibold mb-4">Mesačné Rozpočty</h2>
                 <BudgetForm ... />
                 <BudgetStatusList ... />
             </section> */}
        </div>
    );
};
export default DashboardPage;