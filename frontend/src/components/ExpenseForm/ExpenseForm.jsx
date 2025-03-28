// src/components/ExpenseForm/ExpenseForm.jsx
import React, { useState } from 'react';

// ----- NOVÉ: Definícia kategórií -----
const CATEGORIES = [
  "Potraviny",
  "Bývanie",
  "Doprava",
  "Zábava",
  "Oblečenie",
  "Zdravie",
  "Vzdelávanie",
  "Reštaurácie",
  "Úspory/Investície",
  "Ostatné" // Vždy je dobré mať 'Ostatné'
];
// Môžeme pridať aj defaultnú hodnotu, ktorú backend ignoruje alebo spracuje špeciálne
const DEFAULT_CATEGORY_VALUE = ""; // Prázdny reťazec ako indikátor "nevybrané"

const ExpenseForm = ({ onExpenseAdd, isAdding }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  // ----- ZMENA: Inicializácia kategórie na default -----
  const [category, setCategory] = useState(DEFAULT_CATEGORY_VALUE);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!description.trim() || !amount) {
      setError("Popis a suma sú povinné polia.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Suma musí byť platné kladné číslo.");
      return;
    }
    // ----- ZMENA: Získanie kategórie (môže byť DEFAULT_CATEGORY_VALUE) -----
    const finalCategory = category === DEFAULT_CATEGORY_VALUE ? null : category; // Posielaj null ak nie je vybraná

    const newExpenseData = {
      description: description.trim(),
      amount: parsedAmount,
      // Posielaj kategóriu len ak je vybraná (nie je null)
      ...(finalCategory && { category: finalCategory })
    };

    try {
      await onExpenseAdd(newExpenseData);
      setDescription('');
      setAmount('');
      // ----- ZMENA: Reset kategórie na default -----
      setCategory(DEFAULT_CATEGORY_VALUE);
    } catch (apiError) {
      console.error("Chyba pri odosielaní formulára:", apiError);
      setError(apiError.response?.data?.error || apiError.message || "Nastala chyba pri pridávaní výdavku.");
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Pridať Nový Výdavok</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="mb-3 text-red-600 bg-red-100 p-2 rounded border border-red-300">{error}</p>
        )}
        {/* Popis (bez zmeny) */}
        <div className="mb-3">
          <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
            Popis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Napr. Nákup potravín"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={isAdding}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {/* Suma (bez zmeny) */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">
              Suma (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isAdding}
            />
          </div>

          {/* ----- ZMENA: Kategória ako Dropdown ----- */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">
              Kategória
            </label>
            <select
              id="category"
              value={category} // Hodnota je naviazaná na stav 'category'
              onChange={(e) => setCategory(e.target.value)} // Update stavu pri zmene
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white" // pridané bg-white pre istotu
              disabled={isAdding}
            >
              {/* Defaultná možnosť */}
              <option value={DEFAULT_CATEGORY_VALUE}>-- Vyberte kategóriu --</option>
              {/* Dynamicky generované možnosti z poľa CATEGORIES */}
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* ----- KONIEC ZMENY ----- */}

        </div>

        {/* Tlačidlo (bez zmeny) */}
        <button
          type="submit"
          className={`w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isAdding}
        >
          {isAdding ? 'Pridávam...' : 'Pridať výdavok'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;