import React from 'react';
import { formatDateForDisplay } from '../../../utils/dateUtils';
// Uisti sa, že cesta k utilitám je správna z tohto súboru

// Komponent pre jednu položku príjmu - vylepšený dizajn
const IncomeItem = ({ income, onDelete, onEdit, isProcessing }) => {
    const handleDeleteClick = () => {
        if (window.confirm(`Naozaj chcete zmazať príjem "${income.description}"?`)) {
            onDelete(income.id);
        }
    };
    const handleEditClick = () => {
        onEdit(income);
    };

    const isItemProcessing = isProcessing?.id === income.id;
    const actionType = isProcessing?.type;

    // Pozadie a prechody
    const itemBg = "bg-white"; // Biela ako základ
    const hoverBg = "hover:bg-emerald-50"; // Veľmi jemný zelený nádych pri hoveri
    const processingBg = "bg-amber-50"; // Rovnaká žltá pri spracovaní

    // Farba sumy - zelená pre príjmy
    const amountColor = "text-emerald-600";

    // Ikona pre zdroj (príklad)
    const sourceIcon = (source) => {
        switch (source?.toLowerCase()) {
            case 'plat': return '💼';
            case 'brigáda': return '🛠️';
            case 'prenájom': return '🏠';
            case 'dar': return '🎁';
            default: return '📈'; // Default ikona pre príjem
        }
    };

    return (
        <li className={`flex items-center p-4 border-b border-slate-100 last:border-b-0 transition-all duration-200 ease-out group ${itemBg} ${
            isItemProcessing ? `opacity-60 ${processingBg} pointer-events-none` : hoverBg
        }`}>
            {/* Ikona Zdroja (alebo Dátum) */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-200 flex items-center justify-center mr-4">
                <span className="text-lg" title={income.source || 'Neznámy zdroj'}>
                    {sourceIcon(income.source)}
                </span>
                {/* Alternatíva: Dátumový blok */}
                {/* <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block leading-tight">
                        {new Date(income.date_created).toLocaleDateString('sk-SK', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-slate-800 block leading-tight">
                        {new Date(income.date_created).getDate()}
                    </span>
                </div> */}
            </div>

            {/* Stredná časť: Popis a Dátum */}
            <div className="flex-grow min-w-0 mr-4">
                <span className="font-semibold text-sm text-slate-900 block truncate" title={income.description}>
                    {income.description}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                    {formatDateForDisplay(income.date_created)}
                     {/* Zdroj môžeme zobraziť tu, ak nepoužívame ikonu */}
                     {/* {income.source && income.source !== 'Neznámy zdroj' && ` • ${income.source}`} */}
                </span>
            </div>

            {/* Pravá strana: Suma a Tlačidlá */}
            <div className="flex items-center space-x-1 flex-shrink-0 ml-auto">
                <span className={`font-semibold ${amountColor} text-sm text-right w-24 group-hover:w-auto transition-all duration-200`}>
                    {typeof income.amount === 'number' ? `+${income.amount.toFixed(2)} €` : 'N/A'}
                </span>
                 {/* Tlačidlá sa objavia elegantnejšie */}
                 <div className={`flex items-center space-x-1 transition-opacity duration-200 ease-in-out ${isItemProcessing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
                    <button
                        onClick={handleEditClick}
                        disabled={isItemProcessing}
                        className={`p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-400 transition duration-150 ${
                            isItemProcessing ? 'text-slate-400 cursor-not-allowed' : 'text-slate-400 hover:bg-slate-100 hover:text-sky-600'
                        }`}
                        title="Upraviť príjem"
                    >
                         {/* Ikona Edit */}
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
                        title="Zmazať príjem"
                    >
                        {/* Ikona Delete */}
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                    </button>
                </div>
            </div>
        </li>
    );
};

// Komponent IncomeList
const IncomeList = ({ incomes = [], isLoading, error, onDelete, onEdit, processingItem }) => {

    if (isLoading) {
       return (
           <div className="mt-6 bg-white rounded-xl shadow-lg border border-slate-200 text-center text-slate-500 p-6">
               Načítavam príjmy...
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
             <div className="mt-6 p-4 rounded-lg shadow border border-red-200 bg-red-50" role="alert">
                 <p className="text-sm font-semibold text-red-800">Chyba pri načítaní príjmov</p>
                 <p className="text-sm text-red-700 mt-1">{error}</p>
             </div>
        );
    }

    if (!incomes || incomes.length === 0) {
        return (
            <div className="mt-6 p-6 rounded-xl shadow border border-slate-200 bg-white text-center text-slate-500">
                Zatiaľ žiadne príjmy. Pridajte svoj prvý príjem.
            </div>
        );
     }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-6">
          <h2 className="text-lg font-semibold text-slate-800 p-4 border-b border-slate-100">Zoznam Príjmov</h2>
          <ul>
            {incomes.map(income => (
              <IncomeItem
                key={income.id}
                income={income}
                onDelete={onDelete}
                onEdit={onEdit}
                isProcessing={processingItem}
              />
            ))}
          </ul>
        </div>
    );
};

export default IncomeList;