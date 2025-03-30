import React from 'react';
import { formatDateForDisplay } from '../../../utils/dateUtils';
// Predpokladáme, že utils sú o 2 úrovne vyššie ako components/ExpenseList/

// Komponent pre jednu položku výdavku - vylepšený dizajn
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

    // Pozadie a prechody
    const itemBg = "bg-gradient-to-r from-white via-white to-slate-50"; // Jemný gradient
    const hoverBg = "hover:bg-gradient-to-r hover:from-white hover:to-slate-100"; // Zvýraznenie pri hoveri
    const processingBg = "bg-yellow-50"; // Jemná žltá pri spracovaní

    // Farba sumy - červená pre výdavky
    const amountColor = "text-red-600";

    // Ikonka pre kategóriu (príklad, potrebuješ mapovanie kategórií na ikony)
    // Toto je len placeholder, reálne by si použil knižnicu ikon alebo mapovanie
    const categoryIcon = (category) => {
        // Jednoduché mapovanie na Emoji alebo SVG
        switch (category?.toLowerCase()) {
            case 'potraviny': return '🛒';
            case 'doprava': return '🚌';
            case 'zábava': return '🎉';
            case 'bývanie': return '🏠';
            case 'reštaurácie': return '🍕';
            default: return '💰'; // Default ikona
        }
    };

    return (
        <li className={`flex items-center p-4 border-b border-slate-100 last:border-b-0 transition-all duration-200 ease-out group ${itemBg} ${
            isItemProcessing ? `opacity-60 ${processingBg} pointer-events-none` : hoverBg
        }`}>
            {/* Ikona Kategórie (alebo Dátum) */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center mr-4">
                {/* Zobrazenie ikony kategórie */}
                <span className="text-lg" title={expense.category || 'Nezaradené'}>
                    {categoryIcon(expense.category)}
                </span>
                {/* Alternatíva: Dátumový blok */}
                {/* <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block leading-tight">
                        {new Date(expense.date_created).toLocaleDateString('sk-SK', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-slate-800 block leading-tight">
                        {new Date(expense.date_created).getDate()}
                    </span>
                </div> */}
            </div>

            {/* Stredná časť: Popis a Dátum */}
            <div className="flex-grow min-w-0 mr-4">
                <span className="font-semibold text-sm text-slate-900 block truncate" title={expense.description}>
                    {expense.description}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                    {formatDateForDisplay(expense.date_created)}
                    {/* Pridanie kategórie sem, ak nezobrazujeme ikonu */}
                     {/* {expense.category && expense.category !== 'Nezaradené' && ` • ${expense.category}`} */}
                </span>
            </div>

            {/* Pravá strana: Suma a Tlačidlá (viditeľné pri hover alebo focus) */}
            <div className="flex items-center space-x-1 flex-shrink-0 ml-auto">
                <span className={`font-semibold ${amountColor} text-sm text-right w-24 group-hover:w-auto transition-all duration-200`}>
                    {typeof expense.amount === 'number' ? `-${expense.amount.toFixed(2)} €` : 'N/A'}
                </span>
                {/* Tlačidlá sa objavia elegantnejšie */}
                <div className={`flex items-center space-x-1 transition-opacity duration-200 ease-in-out ${isItemProcessing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
                    <button
                        onClick={handleEditClick}
                        disabled={isItemProcessing}
                        className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition duration-150 ${
                            isItemProcessing ? 'text-slate-400 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
                        }`}
                        title="Upraviť výdavok"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        disabled={isItemProcessing}
                         className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition duration-150 ${
                            isItemProcessing ? 'text-slate-400 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-100 hover:text-red-600'
                        }`}
                        title="Zmazať výdavok"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                    </button>
                </div>
            </div>
        </li>
    );
};

// Komponent ExpenseList - hlavne wrapper a handling stavov
const ExpenseList = ({ expenses = [], isLoading, error, onDelete, onEdit, processingItem, filterVisible }) => {

    if (isLoading) {
       return (
           <div className={`bg-white rounded-xl shadow-lg border border-slate-200 text-center text-slate-500 p-6 ${filterVisible ? 'rounded-t-none border-t-0' : 'mt-6'}`}>
               Načítavam výdavky...
               <div className="space-y-1 mt-4 animate-pulse">
                   <div className="h-16 bg-slate-200 rounded-md"></div>
                   <div className="h-16 bg-slate-200 rounded-md"></div>
                   <div className="h-16 bg-slate-200 rounded-md"></div>
               </div>
           </div>
       );
    }

    if (error) {
        return (
             <div className={`mt-6 p-4 rounded-lg shadow border border-red-200 bg-red-50 ${filterVisible ? 'rounded-t-none border-t-0' : ''}`} role="alert">
                 <p className="text-sm font-semibold text-red-800">Chyba pri načítaní výdavkov</p>
                 <p className="text-sm text-red-700 mt-1">{error}</p>
             </div>
        );
    }

    if (expenses.length === 0) {
        const message = filterVisible
            ? "Pre túto kategóriu zatiaľ neexistujú žiadne výdavky."
            : "Zatiaľ žiadne výdavky. Pridajte svoj prvý výdavok.";
        return (
            <div className={`mt-6 p-6 rounded-xl shadow border border-slate-200 bg-white text-center text-slate-500 ${filterVisible ? 'rounded-t-none border-t-0' : ''}`}>
                {message}
            </div>
        );
     }

    return (
        // Hlavný kontajner zoznamu
        <div className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${filterVisible ? 'rounded-t-none border-t-0' : 'mt-6'}`}>
           {/* Už nepotrebujeme vnútorný padding ani divide-y */}
           <ul>
                {expenses.map(expense => (
                    <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        isProcessing={processingItem}
                    />
                ))}
            </ul>
        </div>
    );
};

export default ExpenseList;