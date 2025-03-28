// frontend/src/components/ExpenseForm/ExpenseForm.jsx
import React, { useState } from 'react';

const CATEGORIES = [
  "Potraviny", "Bývanie", "Doprava", "Zábava", "Oblečenie",
  "Zdravie", "Vzdelávanie", "Reštaurácie", "Úspory/Investície", "Ostatné"
];
const DEFAULT_CATEGORY_VALUE = ""; // Prázdny reťazec

const ExpenseForm = ({ onExpenseAdd, isAdding }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY_VALUE);
  const [formError, setFormError] = useState(null); // Zmena názvu pre jasnoť

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!description.trim()) {
      setFormError("Popis nesmie byť prázdny.");
      return;
    }
    if (!amount) {
        setFormError("Suma je povinná.");
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Suma musí byť platné kladné číslo.");
      return;
    }

    const finalCategory = category === DEFAULT_CATEGORY_VALUE ? null : category;

    const newExpenseData = {
      description: description.trim(),
      amount: parsedAmount,
      ...(finalCategory && { category: finalCategory })
    };

    try {
      await onExpenseAdd(newExpenseData);
      setDescription('');
      setAmount('');
      setCategory(DEFAULT_CATEGORY_VALUE);
    } catch (apiError) {
      // Skús získať chybovú správu z API response, ak je dostupná
      const messages = apiError.response?.data?.messages;
      let errorMessage = "Nastala chyba pri pridávaní výdavku.";
      if (messages) {
          // Ak sú messages objekt (z Marshmallow), skús ich spojiť
          if (typeof messages === 'object') {
             errorMessage = Object.entries(messages)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join('; ');
          } else {
              errorMessage = String(messages); // Ak je to len string
          }
      } else if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
      } else {
          errorMessage = apiError.message; // Fallback na všeobecnú chybu
      }
      setFormError(errorMessage);
      console.error("Chyba pri odosielaní formulára:", apiError.response?.data || apiError);
    }
  };

  return (
    // Použitie Card komponentu by bolo ideálne, ale zatiaľ bez neho
    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Pridať Nový Výdavok</h2>
      <form onSubmit={handleSubmit} noValidate> {/* noValidate pre HTML5 validáciu */}
        {formError && (
          <div className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
            {formError}
          </div>
        )}
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
            disabled={isAdding}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
              disabled={isAdding}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">
              Kategória
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              disabled={isAdding}
            >
              <option value={DEFAULT_CATEGORY_VALUE}>-- Vyberte kategóriu --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

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