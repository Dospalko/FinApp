// src/components/IncomeList/IncomeList.jsx
import React from 'react';

const IncomeItem = ({ income, onDelete, isDeleting }) => {
  const handleDeleteClick = () => {
      if (window.confirm(`Naozaj chcete zmazať príjem "${income.description}"?`)) {
          onDelete(income.id);
      }
  };

  return (
    <li className={`flex flex-wrap justify-between items-center px-4 py-3 bg-white border-b border-slate-200 last:border-b-0 transition duration-150 ease-in-out ${isDeleting ? 'opacity-60 bg-red-50' : 'hover:bg-slate-50'}`}>
      {/* Popis a Zdroj */}
      <div className="flex items-center mb-1 sm:mb-0 mr-4">
        <span className="font-medium text-slate-800 mr-2">{income.description}</span>
        {income.source && income.source !== 'Neznámy zdroj' && (
          <span className="text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
            {income.source}
          </span>
        )}
      </div>
      {/* Suma a Tlačidlo Zmazať */}
      <div className="flex items-center space-x-4 ml-auto">
         <span className="font-semibold text-green-600 text-sm sm:text-base text-right min-w-[70px]">
             {typeof income.amount === 'number' ? `+${income.amount.toFixed(2)} €` : 'N/A'}
         </span>
         <button onClick={handleDeleteClick} disabled={isDeleting} className="..." title="Zmazať príjem">
           {/* ... (SVG ikona koša a text 'Zmazať'/'Mažem...') ... */}
         </button>
      </div>
    </li>
  );
};

const IncomeList = ({ incomes = [], isLoading, error, onDelete, deletingIncomeId }) => {
  if (isLoading) { return <div className="text-center p-4 text-gray-500">Načítavam príjmy...</div>; }
  if (error) { return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">{error}</div>; }
  if (!incomes || incomes.length === 0) { return <div className="text-center p-6 text-slate-500 bg-white rounded-lg shadow-md border border-slate-200">Zatiaľ žiadne príjmy.</div>; }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
      <h2 className="text-xl font-semibold text-slate-800 p-4 border-b border-slate-200">Zoznam Príjmov</h2>
      <ul className="divide-y divide-slate-100">
        {incomes.map(income => (
          <IncomeItem
            key={income.id}
            income={income}
            onDelete={onDelete}
            isDeleting={deletingIncomeId === income.id}
          />
        ))}
      </ul>
    </div>
  );
};

export default IncomeList;