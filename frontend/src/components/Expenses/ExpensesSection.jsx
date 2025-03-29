import React from 'react';
import ExpenseForm from './ExpenseForm/ExpenseForm';
import ExpenseList from './ExpenseList/ExpenseList';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import ExpenseChart from './ExpenseChart/ExpenseChart';

const ExpensesSection = ({
    expensesHook, // Celý objekt vrátený z useExpenses
    processingItem, // Spoločný processing state z App
    onAddExpense, // Handler z App
    onUpdateExpense, // Handler z App
    onDeleteExpense, // Handler z App
}) => {
    // Destructuring hodnôt z hooku
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
        <div className="space-y-6">
            {/* Graf Výdavkov */}
            {!isLoading && categoryChartData.labels.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                    <ExpenseChart chartData={categoryChartData} />
                </div>
            )}

            {/* Formulár Výdavkov */}
            <div id="expense-form-section">
                <ExpenseForm
                    key={editingExpense ? `edit-${editingExpense.id}` : 'add'}
                    formMode={editingExpense ? 'edit' : 'add'}
                    initialData={editingExpense}
                    onExpenseAdd={onAddExpense} // <- Použije handler z App
                    onExpenseUpdate={onUpdateExpense} // <- Použije handler z App
                    isProcessing={
                        processingItem?.type === 'addExpense' ||
                        (processingItem?.type === 'updateExpense' && processingItem?.id === editingExpense?.id)
                    }
                    onCancelEdit={cancelEditingExpense} // <- Použije handler z hooku
                />
            </div>

            {/* Filter a Zoznam Výdavkov */}
            <div>
                {!isLoading && expenses.length > 0 && (
                    <div className="bg-white p-4 rounded-t-lg shadow-md border border-slate-200 border-b-0">
                        <CategoryFilter
                            categories={availableCategories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange} // <- Použije handler z hooku
                        />
                    </div>
                )}
                <ExpenseList
                    expenses={filteredExpenses}
                    isLoading={isLoading}
                    error={error}
                    onDelete={onDeleteExpense} // <- Použije handler z App
                    onEdit={startEditingExpense} // <- Použije handler z hooku
                    processingItem={processingItem}
                    filterVisible={!isLoading && expenses.length > 0}
                />
            </div>
        </div>
    );
};

export default ExpensesSection;