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
    // Zmena: Jemnejší tieň, border
    <div className="p-5 bg-white rounded-lg shadow border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Pridať Nový Výdavok</h2>
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          // Zmena: Trochu iný vzhľad error hlášky
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md border border-red-200" role="alert">
            {formError}
          </div>
        )}
        {/* --- Úpravy Inputov a Labelov --- */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Popis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Napr. Nákup potravín"
            // Zmena: Jemnejší border, výraznejší focus ring
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            disabled={isAdding}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
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
              // Zmena: Rovnaký štýl ako popis
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              disabled={isAdding}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
              Kategória
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              // Zmena: Rovnaký štýl ako inputy + šípka
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none pr-8 bg-no-repeat bg-right bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] transition duration-150 ease-in-out"
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

        {/* --- Úprava Tlačidla --- */}
        <button
          type="submit"
          // Zmena: Výraznejšie tlačidlo, tiene, focus štýly, transition
          className={`w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed`}
          disabled={isAdding}
        >
          {isAdding ? 'Pridávam...' : 'Pridať výdavok'}
        </button>
      </form>
    </div>
  );
};
export default ExpenseForm;