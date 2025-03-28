// frontend/src/components/ExpenseList/ExpenseList.jsx
import React from 'react';

const ExpenseItem = ({ expense, onDelete, isDeleting }) => { // Pridané props onDelete a isDeleting

  const handleDeleteClick = () => {
      // Pridáme potvrdenie pred mazaním
      if (window.confirm(`Naozaj chcete zmazať výdavok "${expense.description}"?`)) {
          onDelete(expense.id); // Zavolaj funkciu z parent komponentu s ID výdavku
      }
  };

  return (
    <li className={`p-3 mb-2 border border-gray-200 rounded-md flex justify-between items-center bg-white shadow-sm transition duration-150 ease-in-out ${isDeleting ? 'opacity-50 bg-red-50' : 'hover:bg-gray-50'}`}>
      {/* Popis a Kategória (bez zmeny) */}
      <div>
        <span className="font-medium text-gray-800">{expense.description}</span>
        {expense.category && expense.category !== 'Nezaradené' && (
          <span className="ml-2 text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
            {expense.category}
          </span>
        )}
      </div>

      {/* Suma a Tlačidlá */}
      <div className="flex items-center space-x-3">
         <span className="font-semibold text-red-600 w-20 text-right"> {/* Pridaná šírka pre zarovnanie */}
             {typeof expense.amount === 'number' ? `${expense.amount.toFixed(2)} €` : 'N/A'}
         </span>
         {/* Tlačidlo Zmazať */}
         <button
           onClick={handleDeleteClick}
           disabled={isDeleting} // Zablokuj počas mazania
           className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400 transition duration-150 ease-in-out ${isDeleting ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-100 hover:text-red-800'}`}
           title="Zmazať výdavok" // Pridaný title pre tooltip
         >
           {isDeleting ? 'Mažem...' : 'Zmazať'}
         </button>
         {/* TODO: Neskôr tlačidlo Upraviť */}
         {/* <button className="text-blue-500 hover:text-blue-700 text-sm">Upraviť</button> */}
      </div>
    </li>
  );
};

const ExpenseList = ({ expenses = [], isLoading, error, onDelete, deletingExpenseId }) => {
  if (isLoading) {
    return <div className="text-center p-4 text-gray-500">Načítavam výdavky...</div>;
  }

  if (error) {
    return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">{error}</div>;
  }

  if (!expenses || expenses.length === 0) {
    return <div className="text-center p-4 text-gray-500">Zatiaľ žiadne výdavky. Pridajte prvý!</div>;
  }

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Zoznam Výdavkov</h2>
      <ul className="space-y-2">
        {expenses.map(expense => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onDelete={onDelete} // Posunutie funkcie ďalej
            isDeleting={deletingExpenseId === expense.id} // Je táto položka práve mazaná?
          />
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;