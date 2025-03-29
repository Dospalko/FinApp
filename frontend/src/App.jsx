import React, { useState, useMemo } from 'react';

// Import nových sekcií a hookov
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import SummarySection from './components/Summary/SummarySection';
import ExpensesSection from './components/Expenses/ExpensesSection';
import IncomesSection from './components/Incomes/IncomesSection';
import { usePing } from './hooks/usePing';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';

function App() {
    // --- Použitie Custom Hooks ---
    const { pingMessage, showPing } = usePing(); // Hook pre ping
    const expensesHook = useExpenses();           // Hook pre výdavky
    const incomesHook = useIncomes();             // Hook pre príjmy

    // --- Zdieľaný Stav ---
    // Stav pre indikáciu prebiehajúcej akcie naprieč celou aplikáciou
    const [processingItem, setProcessingItem] = useState(null);

    // --- Handlery, ktoré potrebujú meniť processingItem a volať hooky ---
    // (Wrapper funkcie okolo handlerov z hookov)

    // Výdavky
    const handleAddExpense = async (data) => {
        setProcessingItem({ type: 'addExpense', id: null });
        try {
            await expensesHook.addExpenseHandler(data);
        } catch (error) {
            // Chyba je už zalogovaná v hooku, tu môžeme prípadne zobraziť globálnu notifikáciu
            throw error; // Re-throw pre formulár
        } finally {
            setProcessingItem(null);
        }
    };

    const handleUpdateExpense = async (id, data) => {
        setProcessingItem({ type: 'updateExpense', id });
        try {
            await expensesHook.updateExpenseHandler(id, data);
        } catch (error) {
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleDeleteExpense = async (id) => {
        setProcessingItem({ type: 'deleteExpense', id });
        try {
            await expensesHook.deleteExpenseHandler(id);
        } catch (error) {
             // Nastav chybu do stavu Expenses Hooku, aby ju ExpenseList zobrazil
            expensesHook.setError(`Chyba pri mazaní výdavku: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessingItem(null);
        }
    };

    // Príjmy
    const handleAddIncome = async (data) => {
        setProcessingItem({ type: 'addIncome', id: null });
        try {
            await incomesHook.addIncomeHandler(data);
        } catch (error) {
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

     const handleUpdateIncome = async (id, data) => {
        setProcessingItem({ type: 'updateIncome', id });
        try {
            await incomesHook.updateIncomeHandler(id, data);
        } catch (error) {
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleDeleteIncome = async (id) => {
        setProcessingItem({ type: 'deleteIncome', id });
         try {
            await incomesHook.deleteIncomeHandler(id);
        } catch (error) {
            // Nastav chybu do stavu Incomes Hooku
             incomesHook.setError(`Chyba pri mazaní príjmu: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessingItem(null);
        }
    };

     // --- Výpočty pre Súhrn (zostávajú tu, lebo potrebujú dáta z oboch hookov) ---
    const totalIncome = useMemo(() => incomesHook.incomes.reduce((sum, income) => sum + income.amount, 0), [incomesHook.incomes]);
    const totalExpenses = useMemo(() => expensesHook.expenses.reduce((sum, expense) => sum + expense.amount, 0), [expensesHook.expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);


    // --- JSX Renderovanie (teraz oveľa čistejšie) ---
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Použitie nových komponentov */}
                <Header pingMessage={pingMessage} showPing={showPing} />

                <SummarySection
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                    balance={balance}
                    isExpensesLoading={expensesHook.isLoading}
                    isIncomesLoading={incomesHook.isLoading}
                />

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Sekcia Výdavkov */}
                    <ExpensesSection
                         expensesHook={expensesHook} // Posielame celý hook objekt
                         processingItem={processingItem}
                         onAddExpense={handleAddExpense} // Posielame wrapper handlery
                         onUpdateExpense={handleUpdateExpense}
                         onDeleteExpense={handleDeleteExpense}
                    />

                    {/* Sekcia Príjmov */}
                     <IncomesSection
                        incomesHook={incomesHook} // Posielame celý hook objekt
                        processingItem={processingItem}
                        onAddIncome={handleAddIncome} // Posielame wrapper handlery
                        onUpdateIncome={handleUpdateIncome}
                        onDeleteIncome={handleDeleteIncome}
                    />
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default App;