// frontend/src/components/ExpenseList/ExpenseList.jsx
import React from 'react';

// --- Komponent pre jednu položku v zozname ---
const ExpenseItem = ({ expense, onDelete, onEdit, isProcessing }) => {

    // Handler pre kliknutie na Zmazať
    const handleDeleteClick = () => {
        if (window.confirm(`Naozaj chcete zmazať výdavok "${expense.description}"?`)) {
            onDelete(expense.id); // Zavolá funkciu z App.jsx
        }
    };

    // Handler pre kliknutie na Upraviť
    const handleEditClick = () => {
        onEdit(expense); // Zavolá funkciu z App.jsx s celým objektom
    };

    // Zistíme, či táto položka prechádza nejakou akciou a akou
    const isItemProcessing = isProcessing?.id === expense.id;
    const actionType = isProcessing?.type; // 'delete', 'update', 'addExpense', atď.

    return (
        <li className={`p-3 mb-2 border border-gray-200 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white shadow-sm transition duration-150 ease-in-out ${
            isItemProcessing ? 'opacity-60 bg-yellow-50 pointer-events-none' : 'hover:bg-gray-50' // Štýl počas spracovania
        }`}>
            {/* Časť s popisom a kategóriou */}
            <div className="mb-2 sm:mb-0 flex-grow mr-4">
                <span className="font-medium text-gray-800 block sm:inline">{expense.description}</span>
                {expense.category && expense.category !== 'Nezaradené' && (
                    <span className="ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {expense.category}
                    </span>
                )}
            </div>

            {/* Časť so sumou a tlačidlami */}
            <div className="flex items-center justify-end space-x-2">
                {/* Suma */}
                <span className="font-semibold text-red-600 w-24 text-right flex-shrink-0">
                    {typeof expense.amount === 'number' ? `${expense.amount.toFixed(2)} €` : 'N/A'}
                </span>

                {/* Tlačidlo Upraviť */}
                <button
                    onClick={handleEditClick}
                    disabled={isItemProcessing} // Zablokované počas spracovania tejto položky
                    className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 transition duration-150 ease-in-out ${
                        isItemProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100 hover:text-blue-800'
                    }`}
                    title="Upraviť výdavok"
                >
                    {/* Zmena textu počas ukladania úpravy */}
                    {(isItemProcessing && actionType === 'updateExpense') ? 'Ukladám...' : 'Upraviť'}
                </button>

                {/* Tlačidlo Zmazať */}
                <button
                    onClick={handleDeleteClick}
                    disabled={isItemProcessing} // Zablokované počas spracovania tejto položky
                    className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition duration-150 ease-in-out ${
                        isItemProcessing ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100 hover:text-red-800'
                    }`}
                    title="Zmazať výdavok"
                >
                    {/* Zmena textu počas mazania */}
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