// src/components/IncomeForm/IncomeForm.jsx
import React, { useState } from 'react';

const IncomeForm = ({ onIncomeAdd, isAdding }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(''); // Zdroj príjmu
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    // Validácia
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

    // Príprava dát pre API
    const newIncomeData = {
      description: description.trim(),
      amount: parsedAmount,
      ...(source.trim() && { source: source.trim() }) // Pridaj zdroj len ak je vyplnený
    };

    // Volanie API a spracovanie odpovede/chyby
    try {
      await onIncomeAdd(newIncomeData); // Zavolaj funkciu z App.jsx
      // Reset formulára po úspechu
      setDescription('');
      setAmount('');
      setSource('');
    } catch (apiError) {
      // Získanie chybovej správy (podobne ako v ExpenseForm)
      const messages = apiError.response?.data?.messages;
      let errorMessage = "Nastala chyba pri pridávaní príjmu.";
      if (messages && typeof messages === 'object') {
         errorMessage = Object.entries(messages)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
      } else if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
      } else if (apiError.message) {
          errorMessage = apiError.message;
      }
      setFormError(errorMessage);
      console.error("Chyba pri odosielaní formulára príjmu:", apiError.response?.data || apiError);
    }
  };

  // --- JSX s Tailwind Triedami ---
  return (
    <div className="p-5 bg-white rounded-lg shadow border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Pridať Nový Príjem</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Zobrazenie chyby */}
        {formError && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md border border-red-200" role="alert">
            {formError}
          </div>
         )}
        {/* Popis */}
        <div className="mb-4">
          <label htmlFor="income-description" className="block text-sm font-medium text-slate-700 mb-1">
            Popis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="income-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Napr. Výplata, Predaj na Bazoši"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" // Zmenená focus farba na zelenú (emerald)
            disabled={isAdding}
          />
        </div>
        {/* Suma a Zdroj vedľa seba */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="income-amount" className="block text-sm font-medium text-slate-700 mb-1">
              Suma (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="income-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" // Zelený focus
              disabled={isAdding}
            />
          </div>
          <div>
            <label htmlFor="income-source" className="block text-sm font-medium text-slate-700 mb-1">
              Zdroj (nepovinné)
            </label>
            <input
              type="text"
              id="income-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Napr. Zamestnávateľ, Klient"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" // Zelený focus
              disabled={isAdding}
            />
          </div>
        </div>
        {/* Tlačidlo Odoslať */}
        <button
          type="submit"
          // Zelené tlačidlo pre príjmy
          className={`w-full px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed`}
          disabled={isAdding}
        >
          {isAdding ? 'Pridávam...' : 'Pridať príjem'}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;