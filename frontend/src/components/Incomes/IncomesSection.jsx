import React from 'react';
import IncomeForm from './IncomeForm/IncomeForm';
import IncomeList from './IncomeList/IncomeList';

const IncomesSection = ({
    incomesHook, // Celý objekt vrátený z useIncomes
    processingItem, // Spoločný processing state z App
    onAddIncome, // Handler z App
    onUpdateIncome, // Handler z App
    onDeleteIncome, // Handler z App
}) => {
    // Destructuring hodnôt z hooku
    const {
        incomes,
        isLoading,
        error,
        editingIncome,
        startEditingIncome,
        cancelEditingIncome,
    } = incomesHook;

    return (
         <div className="space-y-6">
            {/* Formulár Príjmov */}
             <div id="income-form-section">
                <IncomeForm
                    key={editingIncome ? `edit-inc-${editingIncome.id}` : 'add-inc'}
                    formMode={editingIncome ? 'edit' : 'add'}
                    initialData={editingIncome}
                    onIncomeAdd={onAddIncome} // <- Použije handler z App
                    onIncomeUpdate={onUpdateIncome} // <- Použije handler z App
                    isProcessing={
                        processingItem?.type === 'addIncome' ||
                        (processingItem?.type === 'updateIncome' && processingItem?.id === editingIncome?.id)
                    }
                    onCancelEdit={cancelEditingIncome} // <- Použije handler z hooku
                />
            </div>

            {/* Zoznam Príjmov */}
            <IncomeList
                incomes={incomes}
                isLoading={isLoading}
                error={error}
                onDelete={onDeleteIncome} // <- Použije handler z App
                onEdit={startEditingIncome} // <- Použije handler z hooku
                processingItem={processingItem}
            />
        </div>
    );
};

export default IncomesSection;