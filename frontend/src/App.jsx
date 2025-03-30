import React, { useState, useMemo} from 'react';

// Import Hookov
import { usePing } from './hooks/usePing';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';
// Nepotrebujeme API funkcie priamo tu, sú v hookoch
// ALEBO potrebujeme setBudget pre BudgetSetup
import { setBudget } from './api/budgetApi'; // Uprav cestu ak treba

// Import Komponentov Sekcií
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import SummarySection from './components/Summary/SummarySection';
import ExpensesSection from './components/Expenses/ExpensesSection'; // Predpokladáme, že tento existuje a je správny
import IncomesSection from './components/Incomes/IncomesSection';   // Predpokladáme, že tento existuje a je správny
import BudgetSetup from './components/Budgeting/BudgetSetup';       // Nový pre nastavenie
import BudgetStatus from './components/Budgeting/BudgetStatus';     // Nový pre stav
import Rule503020Status from './components/Budgeting/Rule503020Status'; // Nový pre pravidlo

function App() {
    // --- Hooky ---
    const { pingMessage, showPing } = usePing();
    const expensesHook = useExpenses();
    const incomesHook = useIncomes();

    // --- Zdieľaný Stav ---
    const [processingItem, setProcessingItem] = useState(null); // Sleduje Add/Update/Delete

    // --- Stav pre Výber Obdobia Rozpočtu ---
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // --- Wrapper Handlery ---

    // Výdavky
    const handleAddExpense = async (data) => {
        setProcessingItem({ type: 'addExpense', id: null });
        try {
            await expensesHook.addExpenseHandler(data);
        } catch (error) {
            // Chyba spracovaná vo formulári cez re-throw
            console.error("App: Add Expense Error", error);
            throw error;
        } finally {
            setProcessingItem(null);
        }
    };

    const handleUpdateExpense = async (id, data) => {
        setProcessingItem({ type: 'updateExpense', id });
        try {
            await expensesHook.updateExpenseHandler(id, data);
        } catch (error) {
            console.error("App: Update Expense Error", error);
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
             expensesHook.setError(`Chyba pri mazaní výdavku: ${error.message}`);
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
            console.error("App: Add Income Error", error);
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
             console.error("App: Update Income Error", error);
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
             incomesHook.setError(`Chyba pri mazaní príjmu: ${error.message}`);
        } finally {
            setProcessingItem(null);
        }
    };

     // --- Výpočty pre Súhrn ---
    const totalIncome = useMemo(() => incomesHook.incomes.reduce((sum, income) => sum + income.amount, 0), [incomesHook.incomes]);
    const totalExpenses = useMemo(() => expensesHook.expenses.reduce((sum, expense) => sum + expense.amount, 0), [expensesHook.expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

    // --- Handlery pre Výber Mesiaca/Roka ---
    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value, 10));
        // Reset edit módu pri zmene obdobia? Voliteľné.
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    };
    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value, 10));
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    };

    const yearOptions = useMemo(() => {
        const years = [];
        for (let y = currentYear + 1; y >= currentYear - 5; y--) { years.push(y); }
        return years;
    }, [currentYear]);

    // --- JSX Renderovanie ---
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <Header pingMessage={pingMessage} showPing={showPing} />

                <SummarySection
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                    balance={balance}
                    isExpensesLoading={expensesHook.isLoading}
                    isIncomesLoading={incomesHook.isLoading}
                />

                {/* --- Výber Obdobia Rozpočtu --- */}
                 <div className="my-8 p-4 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <label htmlFor="month-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                        Prehľad za obdobie:
                    </label>
                    <div className="flex gap-2">
                        <select
                            id="month-select"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-150"
                        >
                            {[...Array(12).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('sk-SK', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                         <select
                            id="year-select"
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-150"
                        >
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                         </select>
                    </div>
                 </div>

                {/* --- Sekcia Rozpočtovania --- */}
                 <section aria-labelledby="budget-section-title" className="mb-8">
                    <h2 id="budget-section-title" className="text-2xl font-semibold text-slate-800 mb-4 sr-only">
                        Rozpočty
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Zobrazenie stavu rozpočtov */}
                        <div className="lg:col-span-1">
                             <BudgetStatus selectedYear={selectedYear} selectedMonth={selectedMonth} />
                        </div>
                         {/* Pravidlo 50/30/20 */}
                        <div className="lg:col-span-1">
                            <Rule503020Status selectedYear={selectedYear} selectedMonth={selectedMonth} />
                        </div>
                        {/* Nastavenie rozpočtov */}
                        <div className="lg:col-span-1">
                             <BudgetSetup
                                 selectedYear={selectedYear}
                                 selectedMonth={selectedMonth}
                                 // Posielame unikátne kategórie z hooku
                                 allExpenseCategories={expensesHook.availableCategories}
                                 // Tu by mohol byť globálny isProcessing, ak by save bol zložitý
                             />
                         </div>
                    </div>
                 </section>

                {/* --- Hlavný Obsah (Výdavky a Príjmy) --- */}
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <ExpensesSection
                         expensesHook={expensesHook}
                         processingItem={processingItem}
                         onAddExpense={handleAddExpense}
                         onUpdateExpense={handleUpdateExpense}
                         onDeleteExpense={handleDeleteExpense}
                    />
                     <IncomesSection
                        incomesHook={incomesHook}
                        processingItem={processingItem}
                        onAddIncome={handleAddIncome}
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