// src/components/Budgeting/BudgetSetup.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getBudgets, setBudget } from '../../api/budgetApi'; // Import API funkcií

// Predpokladáme import kategórií, napr. z ExpenseForm alebo zdieľaného súboru
const CATEGORIES = [
  "Potraviny", "Bývanie", "Doprava", "Zábava", "Oblečenie",
  "Zdravie", "Vzdelávanie", "Reštaurácie", "Úspory/Investície", "Ostatné"
];

const BudgetSetup = ({ selectedYear, selectedMonth }) => {
  const [budgets, setBudgets] = useState({}); // Objekt: { categoryName: amount }
  const [inputs, setInputs] = useState({});   // Objekt na držanie hodnôt inputov
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Funkcia na načítanie rozpočtov
  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const fetchedBudgets = await getBudgets(selectedYear, selectedMonth);
      // Prevod poľa objektov na objekt pre ľahší prístup a predvyplnenie
      const budgetMap = fetchedBudgets.reduce((acc, budget) => {
        acc[budget.category] = budget.amount;
        return acc;
      }, {});
      setBudgets(budgetMap);
      // Predvyplň inputy načítanými hodnotami alebo prázdnym stringom
      const initialInputs = CATEGORIES.reduce((acc, category) => {
        acc[category] = budgetMap[category]?.toString() || '';
        return acc;
      }, {});
      setInputs(initialInputs);
    } catch (err) {
      setError('Chyba pri načítaní rozpočtov.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  // Načítaj rozpočty pri zmene mesiaca/roka
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Handler pre zmenu v inpute
  const handleInputChange = (category, value) => {
    setInputs(prevInputs => ({
      ...prevInputs,
      [category]: value
    }));
     // Vyčisti správu o úspechu pri zmene
     if (successMessage) setSuccessMessage('');
  };

  // Handler pre uloženie všetkých rozpočtov
  const handleSaveBudgets = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');
    let hasError = false;

    // Prejdeme cez všetky kategórie a ich input hodnoty
    for (const category of CATEGORIES) {
      const amountStr = inputs[category];
      // Ak input nie je prázdny, skúsime ho uložiť
      if (amountStr.trim() !== '') {
        const amount = parseFloat(amountStr);
        // Validácia sumy
        if (isNaN(amount) || amount < 0) {
          setError(`Neplatná suma pre kategóriu "${category}". Zadajte kladné číslo.`);
          hasError = true;
          break; // Zastav pri prvej chybe
        }
        // Priprav dáta pre API
        const budgetData = {
          category: category,
          amount: amount,
          month: selectedMonth,
          year: selectedYear
        };
        // Zavolaj API (vytvorí alebo updatne)
        try {
          await setBudget(budgetData);
        } catch (err) {
          setError(`Chyba pri ukladaní rozpočtu pre "${category}". Skúste znova.`);
          console.error(`Error saving budget for ${category}:`, err);
          hasError = true;
          break; // Zastav pri prvej chybe
        }
      } else {
          // Ak je input prázdny a existuje predtým uložený rozpočet, môžeme ho "vymazať" nastavením na 0?
          // Alebo backend by mal zvládnuť absenciu dát. Pre jednoduchosť zatiaľ ignorujeme prázdne.
          // Ak by sme chceli mazať rozpočet odstránením sumy, potrebovali by sme DELETE endpoint alebo špeciálnu logiku.
          // Najjednoduchšie je nechať to tak - ak chceš rozpočet 0, zadaj 0. Ak ho nechceš, nechaj prázdne.
      }
    }

    setIsSaving(false);
    if (!hasError) {
      setSuccessMessage('Rozpočty boli úspešne uložené!');
      // Znova načítaj rozpočty, aby sa zobrazili aktuálne hodnoty (nepovinné, ale dobré pre potvrdenie)
      fetchBudgets();
       // Vyčisti správu po pár sekundách
       setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-lg font-semibold mb-5 text-slate-800">Nastaviť Rozpočty ({selectedMonth}/{selectedYear})</h2>

      {isLoading && <p className="text-slate-500 text-center">Načítavam...</p>}
      {error && <p className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200 mb-4">{error}</p>}
      {successMessage && <p className="p-3 text-sm text-green-800 bg-green-100 rounded-lg border border-green-200 mb-4">{successMessage}</p>}

      {!isLoading && (
        <div className="space-y-3">
          {CATEGORIES.map(category => (
            <div key={category} className="flex items-center justify-between space-x-4">
              <label htmlFor={`budget-${category}`} className="text-sm font-medium text-slate-700 w-2/5 truncate" title={category}>
                {category}
              </label>
              <div className="relative w-3/5">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">€</span>
                 <input
                    type="number"
                    id={`budget-${category}`}
                    value={inputs[category] || ''}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-right disabled:bg-slate-100"
                    disabled={isSaving}
                 />
              </div>
            </div>
          ))}
          <div className="pt-4 text-right">
            <button
              onClick={handleSaveBudgets}
              disabled={isLoading || isSaving}
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Ukladám...' : 'Uložiť rozpočty'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetSetup;