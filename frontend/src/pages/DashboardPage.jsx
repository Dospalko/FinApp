import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useExpenses } from '../hooks/useExpenses';
import { useIncomes } from '../hooks/useIncomes';

// Dashboard Components
import WeeklySnapshotCard from '../components/Reports/WeeklySnapshotCard';
import SummarySection from '../components/Summary/SummarySection';
import ExpensesSection from '../components/Expenses/ExpensesSection';
import IncomesSection from '../components/Incomes/IncomesSection';
import BudgetsDisplay from '../components/Budgeting/BudgetsDisplay';
import Rule503020Status from '../components/Budgeting/Rule503020Status';
import Tabs from '../components/Shared/Tabs';
import DateSelector from '../components/Shared/DateSelector';
import ReportGenerator from '../components/Reports/ReportGenerator';

// Helper pre animácie
const motionProps = {
  initial: "hidden",
  animate: "visible",
  exit: "exit"
};

const DashboardPage = () => {
    const expensesHook = useExpenses();
    const incomesHook = useIncomes();
    const [processingItem, setProcessingItem] = useState(null);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [activeTab, setActiveTab] = useState('expenses');

    // --- Handlers ---
    const handleAddExpense = useCallback(async (data) => {
        setProcessingItem({ type: 'addExpense', id: null });
        try { await expensesHook.addExpenseHandler(data); }
        catch (error) { console.error("DashboardPage: Add Expense Error", error); throw error; }
        finally { setProcessingItem(null); }
    }, [expensesHook]);

     const handleUpdateExpense = useCallback(async (id, data) => {
         setProcessingItem({ type: 'updateExpense', id });
         try { await expensesHook.updateExpenseHandler(id, data); }
         catch (error) { console.error("DashboardPage: Update Expense Error", error); throw error; }
         finally { setProcessingItem(null); }
     }, [expensesHook]);

     const handleDeleteExpense = useCallback(async (id) => {
        setProcessingItem({ type: 'deleteExpense', id });
        try { await expensesHook.deleteExpenseHandler(id); }
        catch (error) { expensesHook.setError(`Chyba pri mazaní výdavku: ${error.message || 'Neznáma chyba'}`); }
        finally { setProcessingItem(null); }
    }, [expensesHook]);

    const handleAddIncome = useCallback(async (data) => {
        setProcessingItem({ type: 'addIncome', id: null });
        try { await incomesHook.addIncomeHandler(data); }
        catch (error) { console.error("DashboardPage: Add Income Error", error); throw error; }
        finally { setProcessingItem(null); }
    }, [incomesHook]);

    const handleUpdateIncome = useCallback(async (id, data) => {
        setProcessingItem({ type: 'updateIncome', id });
        try { await incomesHook.updateIncomeHandler(id, data); }
        catch (error) { console.error("DashboardPage: Update Income Error", error); throw error; }
        finally { setProcessingItem(null); }
     }, [incomesHook]);

    const handleDeleteIncome = useCallback(async (id) => {
        setProcessingItem({ type: 'deleteIncome', id });
         try { await incomesHook.deleteIncomeHandler(id); }
         catch (error) { incomesHook.setError(`Chyba pri mazaní príjmu: ${error.message || 'Neznáma chyba'}`); }
         finally { setProcessingItem(null); }
    }, [incomesHook]);
    // ---

    const totalIncome = useMemo(() => incomesHook.incomes.reduce((sum, income) => sum + (income.amount || 0), 0), [incomesHook.incomes]);
    const totalExpenses = useMemo(() => expensesHook.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0), [expensesHook.expenses]);
    const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

    const handleMonthChange = useCallback((event) => {
        setSelectedMonth(parseInt(event.target.value, 10));
        // Reset edit states if needed (ideally handled within hooks)
        // expensesHook.cancelEditingExpense();
        // incomesHook.cancelEditingIncome();
    }, []);

    const handleYearChange = useCallback((event) => {
        setSelectedYear(parseInt(event.target.value, 10));
        // expensesHook.cancelEditingExpense();
        // incomesHook.cancelEditingIncome();
    }, []);

    // --- Animácie a Taby ---
    const TABS = useMemo(() => [ { id: 'expenses', name: 'Výdavky' }, { id: 'incomes', name: 'Príjmy' }, { id: 'budgets', name: 'Rozpočty' }, ], []);
    const tabContentVariants = useMemo(() => ({ hidden: { opacity: 0, y: 10, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }, exit: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } } }), []);
    const budgetSectionVariants = useMemo(() => ({ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }), []);
    const budgetItemVariants = useMemo(() => ({ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }), []);
    const summaryVariants = useMemo(() => ({ hidden: { opacity: 0, y: -15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }), []);
    // ---

    return (
        <div className="space-y-6">
            {/* Weekly Snapshot Card with collapse functionality */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <WeeklySnapshotCard />
            </motion.div>

            {/* Existing Summary Section */}
            <motion.div variants={summaryVariants} {...motionProps}>
                <SummarySection 
                    totalIncome={totalIncome} 
                    totalExpenses={totalExpenses} 
                    balance={balance} 
                    isExpensesLoading={expensesHook.isLoading} 
                    isIncomesLoading={incomesHook.isLoading} 
                />
            </motion.div>

            {/* Existing Tabs */}
            <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Existing Tab Content */}
            <AnimatePresence mode='wait'>
                <motion.div key={activeTab} variants={tabContentVariants} {...motionProps} className="mt-6">
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                <DateSelector 
                                    selectedMonth={selectedMonth} 
                                    selectedYear={selectedYear} 
                                    onMonthChange={handleMonthChange} 
                                    onYearChange={handleYearChange} 
                                />
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
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

                            <motion.div
                                className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8"
                                variants={budgetSectionVariants}
                                {...motionProps}
                            >
                                <motion.div variants={budgetItemVariants} className="xl:col-span-2">
                                    <BudgetsDisplay
                                        selectedYear={selectedYear}
                                        selectedMonth={selectedMonth}
                                    />
                                </motion.div>

                                <motion.div variants={budgetItemVariants}>
                                    <Rule503020Status
                                        selectedYear={selectedYear}
                                        selectedMonth={selectedMonth}
                                    />
                                </motion.div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
export default DashboardPage;
