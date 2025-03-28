// src/components/ExpenseList/ExpenseList.jsx
import React from 'react';

// Jednoduchý komponent pre položku v zozname
const ExpenseItem = ({ expense }) => (
  <li className="p-3 mb-2 border rounded-md flex justify-between items-center bg-white shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out">
    <div>
      <span className="font-medium text-gray-800">{expense.description}</span>
      {expense.category && (
        <span className="ml-2 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
          {expense.category}
        </span>
      )}
    </div>
    <span className="font-semibold text-red-600">
      {/* Formatovanie meny môžeme vylepšiť */}
      {typeof expense.amount === 'number' ? `${expense.amount.toFixed(2)} €` : 'N/A'}
    </span>
    {/* Tu môžeme neskôr pridať tlačidlá na úpravu/mazanie */}
  </li>
);

const ExpenseList = ({ expenses = [], isLoading, error }) => {
  if (isLoading) {
    return <p className="text-center text-gray-500">Načítavam výdavky...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>;
  }

  if (!expenses || expenses.length === 0) {
    return <p className="text-center text-gray-500">Zatiaľ žiadne výdavky.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Zoznam Výdavkov</h2>
      <ul className="space-y-2">
        {expenses.map(expense => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;