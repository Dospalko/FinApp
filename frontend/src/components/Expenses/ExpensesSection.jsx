import React from 'react';
import ExpenseList from './ExpenseList/ExpenseList';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import ExpenseForm from './ExpenseForm/ExpenseForm';
import ExpenseChart from './ExpenseChart/ExpenseChart';

const ExpensesSection = ({
    expensesHook,
    processingItem,
    onAddExpense,
    onUpdateExpense,
    onDeleteExpense,
}) => {
    const {
        expenses,
        filteredExpenses,
        isLoading,
        error,
        editingExpense,
        selectedCategory,
        availableCategories,
        categoryChartData,
        startEditingExpense,
        cancelEditingExpense,
        handleCategoryChange
    } = expensesHook;

    return (
        // Pridáme `rounded-xl` a `bg-slate-50` pre jemné odlíšenie sekcie? Alebo necháme na App.jsx?
        // Necháme to jednoduché, App.jsx má bg-slate-100, komponenty sú biele.
        <div className="space-y-6">
            {/* Graf Výdavkov - prípadne upraviť štýl kontajnera */}
            {!isLoading && categoryChartData.labels.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                    <ExpenseChart chartData={categoryChartData} />
                </div>
            )}

            {/* Formulár Výdavkov */}
            <div id="expense-form-section">
                <ExpenseForm
                    key={editingExpense ? `edit-${editingExpense.id}` : 'add'}
                    formMode={editingExpense ? 'edit' : 'add'}
                    initialData={editingExpense}
                    onExpenseAdd={onAddExpense}
                    onExpenseUpdate={onUpdateExpense}
                    isProcessing={
                        processingItem?.type === 'addExpense' ||
                        (processingItem?.type === 'updateExpense' && processingItem?.id === editingExpense?.id)
                    }
                    onCancelEdit={cancelEditingExpense}
                />
            </div>

            {/* Filter a Zoznam Výdavkov */}
            {/* Kontajner pre Filter a Zoznam */}
            <div>
                 {/* Filter - môžeme ho štýlovať viac ako súčasť hlavičky zoznamu */}
                 {!isLoading && expenses.length > 0 && (
                     <div className="bg-white p-4 rounded-t-xl shadow-lg border border-slate-200 border-b-0">
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
                    isLoading={isLoading}
                    error={error}
                    onDelete={onDeleteExpense}
                    onEdit={startEditingExpense}
                    processingItem={processingItem}
                    // Posielame informáciu, či je filter viditeľný, pre správne zaoblenie rohov
                    filterVisible={!isLoading && expenses.length > 0}
                />
            </div>
        </div>
    );
};

export default ExpensesSection;