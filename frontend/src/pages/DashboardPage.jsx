import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks (Make sure paths are correct relative to this file)
import { useExpenses } from '../hooks/useExpenses';
import { useIncomes } from '../hooks/useIncomes';

// Dashboard Components (Make sure paths are correct)
import SummarySection from '../components/Summary/SummarySection';
import ExpensesSection from '../components/Expenses/ExpensesSection';
import IncomesSection from '../components/Incomes/IncomesSection';
import BudgetSetup from '../components/Budgeting/BudgetSetup';
import BudgetStatus from '../components/Budgeting/BudgetStatus';
import Rule503020Status from '../components/Budgeting/Rule503020Status';
import Tabs from '../components/Shared/Tabs';
import DateSelector from '../components/Shared/DateSelector';
import ReportGenerator from '../components/Reports/ReportGenerator';

// Note: We don't need useAuth here directly, ProtectedRoute handles access.
// The hooks useExpenses/useIncomes use the auth token via apiClient.

const DashboardPage = () => {
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
        catch (error) { console.error("DashboardPage: Add Expense Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
    const handleUpdateExpense = async (id, data) => {
        setProcessingItem({ type: 'updateExpense', id });
        try { await expensesHook.updateExpenseHandler(id, data); }
        catch (error) { console.error("DashboardPage: Update Expense Error", error); throw error; }
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
        catch (error) { console.error("DashboardPage: Add Income Error", error); throw error; }
        finally { setProcessingItem(null); }
    };
     const handleUpdateIncome = async (id, data) => {
        setProcessingItem({ type: 'updateIncome', id });
        try { await incomesHook.updateIncomeHandler(id, data); }
        catch (error) { console.error("DashboardPage: Update Income Error", error); throw error; }
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

    // Vylepšené varianty pre plynulejší prechod tabov (fade + jemný posun)
    const tabContentVariants = useMemo(() => ({
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
    }), []);

    // Varianty pre animáciu budget kariet
    const budgetGridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1 // Oneskorenie medzi deťmi
            }
        }
    };

    const budgetItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    // Varianty pre Summary sekciu
     const summaryVariants = {
        hidden: { opacity: 0, y: -15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };


    return (
        <>
            {/* Animovaná Summary sekcia */}
            <motion.div variants={summaryVariants} initial="hidden" animate="visible">
                <SummarySection
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                    balance={balance}
                    isExpensesLoading={expensesHook.isLoading}
                    isIncomesLoading={incomesHook.isLoading}
                />
            </motion.div>

            <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode='wait'>
                <motion.div
                    key={activeTab} // Kľúč je dôležitý pre AnimatePresence
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-6" // Odstránený overflow-hidden, ak animácie posúvajú obsah
                >
                    {activeTab === 'expenses' && (
                        // Tu môžeme pridať motion.div, ak chceme špecifickú animáciu pre celý Expense blok
                        <ExpensesSection
                            expensesHook={expensesHook}
                            processingItem={processingItem}
                            onAddExpense={handleAddExpense}
                            onUpdateExpense={handleUpdateExpense}
                            onDeleteExpense={handleDeleteExpense}
                        />
                    )}
                    {activeTab === 'incomes' && (
                         // Podobne pre Incomes
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
                            {/* DateSelector a ReportGenerator môžu mať tiež vlastné animácie, ak treba */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{delay: 0.1}}>
                                <DateSelector
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    onMonthChange={handleMonthChange}
                                    onYearChange={handleYearChange}
                                />
                             </motion.div>
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1}} transition={{delay: 0.15}}>
                                <ReportGenerator
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    incomes={incomesHook.incomes}
                                    expenses={expensesHook.expenses}
                                    totalIncome={totalIncome}
                                    totalExpenses={totalExpenses}
                                    balance={balance}
                                />
                              </motion.div>

                            {/* Animovaný grid pre budget karty */}
                            <motion.div
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
                                variants={budgetGridVariants}
                                initial="hidden"
                                animate="visible" // Spustí animáciu staggerChildren
                            >
                                {/* Každá karta je animovaný item */}
                                <motion.div variants={budgetItemVariants}>
                                    <BudgetStatus selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                </motion.div>
                                <motion.div variants={budgetItemVariants}>
                                    <Rule503020Status selectedYear={selectedYear} selectedMonth={selectedMonth} />
                                </motion.div>
                                <motion.div variants={budgetItemVariants}>
                                    <BudgetSetup
                                        selectedYear={selectedYear}
                                        selectedMonth={selectedMonth}
                                        allExpenseCategories={expensesHook.availableCategories}
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default DashboardPage;