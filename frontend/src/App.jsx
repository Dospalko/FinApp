import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { usePing } from './hooks/usePing';
import { useExpenses } from './hooks/useExpenses';
import { useIncomes } from './hooks/useIncomes';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import SummarySection from './components/Summary/SummarySection';
import ExpensesSection from './components/Expenses/ExpensesSection';
import IncomesSection from './components/Incomes/IncomesSection';
import BudgetSetup from './components/Budgeting/BudgetSetup';
import BudgetStatus from './components/Budgeting/BudgetStatus';
import Rule503020Status from './components/Budgeting/Rule503020Status';
import Tabs from './components/Shared/Tabs';
import DateSelector from './components/Shared/DateSelector';
import ReportGenerator from './components/Reports/ReportGenerator';

const DashboardContent = () => {
    const expensesHook = useExpenses();
    const incomesHook = useIncomes();
    const [processingItem, setProcessingItem] = useState(null);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activeTab, setActiveTab] = useState('expenses');

    const handleAddExpense = async (data) => {
        setProcessingItem({ type: 'addExpense', id: null });
        try { await expensesHook.addExpenseHandler(data); }
        catch (error) { console.error("App: Add Expense Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
    const handleUpdateExpense = async (id, data) => {
        setProcessingItem({ type: 'updateExpense', id });
        try { await expensesHook.updateExpenseHandler(id, data); }
        catch (error) { console.error("App: Update Expense Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
    const handleDeleteExpense = async (id) => {
        setProcessingItem({ type: 'deleteExpense', id });
        try { await expensesHook.deleteExpenseHandler(id); }
        catch (error) { expensesHook.setError(`Chyba pri mazaní výdavku: ${error.message || 'Neznáma chyba'}`); }
        finally { setProcessingItem(null); }
    };
    const handleAddIncome = async (data) => {
        setProcessingItem({ type: 'addIncome', id: null });
        try { await incomesHook.addIncomeHandler(data); }
        catch (error) { console.error("App: Add Income Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
     const handleUpdateIncome = async (id, data) => {
        setProcessingItem({ type: 'updateIncome', id });
        try { await incomesHook.updateIncomeHandler(id, data); }
        catch (error) { console.error("App: Update Income Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
    const handleDeleteIncome = async (id) => {
        setProcessingItem({ type: 'deleteIncome', id });
         try { await incomesHook.deleteIncomeHandler(id); }
         catch (error) { incomesHook.setError(`Chyba pri mazaní príjmu: ${error.message || 'Neznáma chyba'}`); }
         finally { setProcessingItem(null); }
    };

    const totalIncome = useMemo(() => incomesHook.incomes.reduce((sum, income) => sum + income.amount, 0), [incomesHook.incomes]);
    const totalExpenses = useMemo(() => expensesHook.expenses.reduce((sum, expense) => sum + expense.amount, 0), [expensesHook.expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

    const handleMonthChange = useCallback((event) => {
        setSelectedMonth(parseInt(event.target.value, 10));
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    }, [expensesHook, incomesHook]);

    const handleYearChange = useCallback((event) => {
        setSelectedYear(parseInt(event.target.value, 10));
        expensesHook.cancelEditingExpense();
        incomesHook.cancelEditingIncome();
    }, [expensesHook, incomesHook]);

    const TABS = useMemo(() => [
        { id: 'expenses', name: 'Výdavky' },
        { id: 'incomes', name: 'Príjmy' },
        { id: 'budgets', name: 'Rozpočty' },
    ], []);

    const tabContentVariants = useMemo(() => ({
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, x: 10, transition: { duration: 0.2, ease: "easeIn" } }
    }), []);

    return (
        <>
            <SummarySection
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                balance={balance}
                isExpensesLoading={expensesHook.isLoading}
                isIncomesLoading={incomesHook.isLoading}
            />
            <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="hidden" animate="visible" exit="exit"
                    className="mt-6 overflow-hidden"
                >
                    {activeTab === 'expenses' && (
                        <ExpensesSection
                            expensesHook={expensesHook}
                            processingItem={processingItem}
                            onAddExpense={handleAddExpense}
                            onUpdateExpense={handleUpdateExpense}
                            onDeleteExpense={handleDeleteExpense}
                        />
                    )}
                    {activeTab === 'incomes' && (
                        <IncomesSection
                            incomesHook={incomesHook}
                            processingItem={processingItem}
                            onAddIncome={handleAddIncome}
                            onUpdateIncome={handleUpdateIncome}
                            onDeleteIncome={handleDeleteIncome}
                        />
                    )}
                    {activeTab === 'budgets' && (
                        <div className="space-y-8">
                            <DateSelector
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                onMonthChange={handleMonthChange}
                                onYearChange={handleYearChange}
                            />
                            <ReportGenerator
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                incomes={incomesHook.incomes}
                                expenses={expensesHook.expenses}
                                totalIncome={totalIncome}
                                totalExpenses={totalExpenses}
                                balance={balance}
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                                <BudgetStatus selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                <Rule503020Status selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                <BudgetSetup
                                    selectedYear={selectedYear}
                                    selectedMonth={selectedMonth}
                                    allExpenseCategories={expensesHook.availableCategories}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

const AppLayout = ({ children }) => {
    const { pingMessage, showPing } = usePing();
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800 flex flex-col">
            <Header pingMessage={pingMessage} showPing={showPing} />
            <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <DashboardContent />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
             <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ProfilePage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;