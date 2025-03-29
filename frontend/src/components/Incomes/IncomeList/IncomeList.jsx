// src/components/IncomeList/IncomeList.jsx
import React from 'react';
import { formatDateForDisplay } from '../../../utils/dateUtils';
// --- NOVÝ IMPORT ---

// --- ÚPRAVA IncomeItem ---
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

  return (
    <li className={`flex flex-wrap justify-between items-center px-4 py-3 bg-white border-b border-slate-200 last:border-b-0 transition duration-150 ease-in-out ${
        isItemProcessing ? 'opacity-60 bg-yellow-50 pointer-events-none' : 'hover:bg-slate-50'
    }`}>
      {/* Popis, Zdroj a Dátum */}
      <div className="flex items-center mb-1 sm:mb-0 mr-4 flex-grow">
        {/* --- PRIDANÉ ZOBRAZENIE DÁTUMU --- */}
        <span className="text-xs text-gray-500 mr-2">
            {/* Predpokladáme, že API vracia pole 'date_created' */}
            {formatDateForDisplay(income.date_created)}
        </span>
        {/* --- KONIEC ZOBRAZENIA DÁTUMU --- */}
        <span className="font-medium text-slate-800 mr-2 break-words">{income.description}</span>
        {income.source && income.source !== 'Neznámy zdroj' && (
          <span className="text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            {income.source}
          </span>
        )}
      </div>
      {/* Suma a Tlačidlá */}
      <div className="flex items-center space-x-2 ml-auto flex-shrink-0">
         <span className="font-semibold text-green-600 text-sm sm:text-base text-right min-w-[80px]">
             {typeof income.amount === 'number' ? `+${income.amount.toFixed(2)} €` : 'N/A'}
         </span>
         <button onClick={handleEditClick} disabled={isItemProcessing} className={`px-2 py-1 text-xs ...`} title="Upraviť príjem">
            {(isItemProcessing && actionType === 'updateIncome') ? 'Ukladám...' : 'Upraviť'}
         </button>
         <button onClick={handleDeleteClick} disabled={isItemProcessing} className={`px-2 py-1 text-xs ...`} title="Zmazať príjem">
           {(isItemProcessing && actionType === 'deleteIncome') ? 'Mažem...' : 'Zmazať'}
         </button>
      </div>
    </li>
  );
};

const IncomeList = ({ incomes = [], isLoading, error, onDelete, onEdit, processingItem }) => {
  if (isLoading) {
       return (
           <div className="mt-6 p-4 rounded-lg shadow-inner bg-gray-50 text-center text-gray-500">
               Načítavam príjmy...
               <div className="space-y-2 mt-4 animate-pulse">
                   <div className="h-10 bg-gray-200 rounded"></div>
                   <div className="h-10 bg-gray-200 rounded"></div>
               </div>
           </div>
       );
  }

  if (error) {
      return (
           <div className="mt-6 p-4 rounded-lg shadow-inner bg-red-50 border border-red-200" role="alert">
               <p className="text-sm text-red-700 font-medium">Chyba pri načítaní príjmov:</p>
               <p className="text-sm text-red-600">{error}</p>
           </div>
      );
  }

  if (!incomes || incomes.length === 0) {
      return (
           <div className="mt-6 p-6 rounded-lg shadow-md border border-slate-200 bg-white text-center text-slate-500">
               Zatiaľ žiadne príjmy. Pridajte svoj prvý príjem.
           </div>
       );
   }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      <h2 className="text-xl font-semibold text-slate-800 p-4 border-b border-slate-200">Zoznam Príjmov</h2>
      <ul className="divide-y divide-slate-100">
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