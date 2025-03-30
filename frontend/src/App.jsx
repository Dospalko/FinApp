import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import Hookov
import { usePing } from './hooks/usePing';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';

// Import Komponentov Sekcií a Zdieľaných Komponentov
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import SummarySection from './components/Summary/SummarySection';
import ExpensesSection from './components/Expenses/ExpensesSection';
import IncomesSection from './components/Incomes/IncomesSection';
import BudgetSetup from './components/Budgeting/BudgetSetup';
import BudgetStatus from './components/Budgeting/BudgetStatus';
import Rule503020Status from './components/Budgeting/Rule503020Status';
import Tabs from './components/Shared/Tabs'; // Nový import
import DateSelector from './components/Shared/DateSelector'; // Nový import

function App() {
    // --- Hooky ---
    const { pingMessage, showPing } = usePing();
    const expensesHook = useExpenses();
    const incomesHook = useIncomes();

    // --- Zdieľaný Stav ---
    const [processingItem, setProcessingItem] = useState(null);

    // --- Stav pre Výber Obdobia ---
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // --- NOVÉ: Stav pre Aktívnu Záložku ---
    const [activeTab, setActiveTab] = useState('expenses'); // Predvolená záložka

    // --- Wrapper Handlery (zostávajú rovnaké) ---
    const handleAddExpense = async (data) => { /* ... */ };
    const handleUpdateExpense = async (id, data) => { /* ... */ };
    const handleDeleteExpense = async (id) => { /* ... */ };
    const handleAddIncome = async (data) => { /* ... */ };
    const handleUpdateIncome = async (id, data) => { /* ... */ };
    const handleDeleteIncome = async (id) => { /* ... */ };

    // --- Výpočty pre Súhrn (zostávajú rovnaké) ---
    const totalIncome = useMemo(() => incomesHook.incomes.reduce((sum, income) => sum + income.amount, 0), [incomesHook.incomes]);
    const totalExpenses = useMemo(() => expensesHook.expenses.reduce((sum, expense) => sum + expense.amount, 0), [expensesHook.expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

    // --- Handlery pre Výber Mesiaca/Roka (zostávajú rovnaké) ---
    const handleMonthChange = (event) => {
        setSelectedMonth(parseInt(event.target.value, 10));
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    };
    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value, 10));
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    };

    // --- Definícia Záložiek ---
    const TABS = [
        { id: 'expenses', name: 'Výdavky' },
        { id: 'incomes', name: 'Príjmy' },
        { id: 'budgets', name: 'Rozpočty' },
        // Môžeme pridať aj prehľad ako samostatnú záložku
        // { id: 'overview', name: 'Prehľad' },
    ];

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

                {/* Komponent Záložiek */}
                <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Podmienené renderovanie obsahu podľa aktívnej záložky */}
                <div className="mt-6">
                    {/* === OBSAH ZÁLOŽKY VÝDAVKY === */}
                    {activeTab === 'expenses' && (
                         // ExpensesSection už obsahuje formulár, filter, graf a zoznam
                        <ExpensesSection
                            expensesHook={expensesHook}
                            processingItem={processingItem}
                            onAddExpense={handleAddExpense}
                            onUpdateExpense={handleUpdateExpense}
                            onDeleteExpense={handleDeleteExpense}
                        />
                    )}

                    {/* === OBSAH ZÁLOŽKY PRÍJMY === */}
                    {activeTab === 'incomes' && (
                        // IncomesSection obsahuje formulár a zoznam
                         <IncomesSection
                            incomesHook={incomesHook}
                            processingItem={processingItem}
                            onAddIncome={handleAddIncome}
                            onUpdateIncome={handleUpdateIncome}
                            onDeleteIncome={handleDeleteIncome}
                        />
                    )}

                    {/* === OBSAH ZÁLOŽKY ROZPOČTY === */}
                    {activeTab === 'budgets' && (
                        <div className="space-y-8">
                            {/* Výber obdobia pre rozpočty */}
                            <DateSelector
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                onMonthChange={handleMonthChange}
                                onYearChange={handleYearChange}
                            />
                             {/* Grid pre rozpočtové komponenty */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                                <BudgetStatus selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                <Rule503020Status selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                <BudgetSetup
                                    selectedYear={selectedYear}
                                    selectedMonth={selectedMonth}
                                    allExpenseCategories={expensesHook.availableCategories}
                                    // isProcessing={...} // Môžeme pridať neskôr
                                    // setBudget={...}   // Predpokladáme, že BudgetSetup volá API priamo
                                />
                            </div>
                        </div>
                    )}

                     {/* === OBSAH ZÁLOŽKY PREHĽAD (Príklad) === */}
                     {/* {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                             {!expensesHook.isLoading && expensesHook.categoryChartData.labels.length > 0 && (
                                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
                                    <h2 className="text-lg font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                                    <ExpenseChart chartData={expensesHook.categoryChartData} />
                                 </div>
                             )}
                             <Rule503020Status selectedYear={selectedYear} selectedMonth={selectedMonth} />

                        </div>
                     )} */}

                </div>

                <Footer />
            </div>
        </div>
    );
}

export default App;