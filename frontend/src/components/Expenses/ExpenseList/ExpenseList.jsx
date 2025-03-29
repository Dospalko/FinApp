// src/components/ExpenseList/ExpenseList.jsx
import React from 'react';
import { formatDateForDisplay } from '../../../utils/dateUtils';
// --- NOVÝ IMPORT ---

// --- ÚPRAVA ExpenseItem ---
const ExpenseItem = ({ expense, onDelete, onEdit, isProcessing }) => {
    const handleDeleteClick = () => {
        if (window.confirm(`Naozaj chcete zmazať výdavok "${expense.description}"?`)) {
            onDelete(expense.id);
        }
    };
    const handleEditClick = () => {
        onEdit(expense);
    };

    const isItemProcessing = isProcessing?.id === expense.id;
    const actionType = isProcessing?.type;

    return (
        <li className={`p-3 mb-2 border border-gray-200 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white shadow-sm transition duration-150 ease-in-out ${
            isItemProcessing ? 'opacity-60 bg-yellow-50 pointer-events-none' : 'hover:bg-gray-50'
        }`}>
            {/* Popis, Kategória a Dátum */}
            <div className="mb-2 sm:mb-0 flex-grow mr-4">
                {/* --- PRIDANÉ ZOBRAZENIE DÁTUMU --- */}
                <span className="text-xs text-gray-500 block sm:inline sm:mr-2">
                    {/* Predpokladáme, že API vracia pole 'date_created' */}
                    {formatDateForDisplay(expense.date_created)}
                </span>
                {/* --- KONIEC ZOBRAZENIA DÁTUMU --- */}
                <span className="font-medium text-gray-800 block sm:inline break-words">{expense.description}</span>
                {expense.category && expense.category !== 'Nezaradené' && (
                    <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {expense.category}
                    </span>
                )}
            </div>

            {/* Suma a Tlačidlá */}
            <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                <span className="font-semibold text-red-600 w-24 text-right">
                    {typeof expense.amount === 'number' ? `${expense.amount.toFixed(2)} €` : 'N/A'}
                </span>
                <button onClick={handleEditClick} disabled={isItemProcessing} className={`px-2 py-1 text-xs ...`} title="Upraviť výdavok">
                    {(isItemProcessing && actionType === 'updateExpense') ? 'Ukladám...' : 'Upraviť'}
                </button>
                <button onClick={handleDeleteClick} disabled={isItemProcessing} className={`px-2 py-1 text-xs ...`} title="Zmazať výdavok">
                   {(isItemProcessing && actionType === 'deleteExpense') ? 'Mažem...' : 'Zmazať'}
                </button>
            </div>
        </li>
    );
};
// --- Komponent pre celý zoznam ---
const ExpenseList = ({ expenses = [], isLoading, error, onDelete, onEdit, processingItem, filterVisible }) => {

    // Zobrazenie počas načítavania
    if (isLoading) {
        // Môžeme zobraziť skeleton loader alebo jednoduchý text
        return (
             <div className="mt-6 p-4 rounded-lg shadow-inner bg-gray-50 text-center text-gray-500">
                 Načítavam výdavky...
                 {/* Príklad skeletonu pre 3 položky */}
                 <div className="space-y-2 mt-4 animate-pulse">
                     <div className="h-10 bg-gray-200 rounded"></div>
                     <div className="h-10 bg-gray-200 rounded"></div>
                     <div className="h-10 bg-gray-200 rounded"></div>
                 </div>
             </div>
        );
    }

    // Zobrazenie chyby
    if (error) {
        return (
             <div className={`mt-6 p-4 rounded-lg shadow-inner ${filterVisible ? 'rounded-t-none border-t-0' : ''} bg-red-50 border border-red-200`} role="alert">
                 <p className="text-sm text-red-700 font-medium">Chyba pri načítaní výdavkov:</p>
                 <p className="text-sm text-red-600">{error}</p>
             </div>
        );
    }

    // Zobrazenie, ak nie sú žiadne výdavky (a nie je chyba/loading)
    if (expenses.length === 0) {
        return (
            <div className={`mt-6 p-6 rounded-lg shadow-inner ${filterVisible ? 'rounded-t-none border-t-0' : ''} bg-gray-50 text-center text-gray-500`}>
                Zatiaľ žiadne výdavky. Pridajte svoj prvý výdavok pomocou formulára vyššie.
            </div>
        );
    }

    // Zobrazenie zoznamu výdavkov
    return (
        // Podmienené zaoblenie rohov, ak je filter viditeľný
        <div className={`bg-white shadow border border-slate-200 ${filterVisible ? 'rounded-b-lg' : 'rounded-lg'}`}>
           <div className="p-4">
                <ul className="space-y-2">
                    {expenses.map(expense => (
                        <ExpenseItem
                            key={expense.id}
                            expense={expense}
                            onDelete={onDelete} // Posielame handler na mazanie
                            onEdit={onEdit}     // Posielame handler na začatie úpravy
                            isProcessing={processingItem} // Posielame info o prebiehajúcej akcii
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExpenseList;