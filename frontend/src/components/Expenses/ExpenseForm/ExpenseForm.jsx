import React, { useState, useEffect } from 'react';

// Definícia kategórií (môže byť aj importovaná z iného súboru)
const CATEGORIES = [
  "Potraviny", "Bývanie", "Doprava", "Zábava", "Oblečenie",
  "Zdravie", "Vzdelávanie", "Reštaurácie", "Úspory/Investície", "Ostatné"
];
const DEFAULT_CATEGORY_VALUE = ""; // Prázdny reťazec pre "nevybrané"

const ExpenseForm = ({
    onExpenseAdd,
    onExpenseUpdate,
    isProcessing, // true ak prebieha Add alebo Update
    initialData = null, // Dáta pre predvyplnenie (null pre Add mód)
    formMode = 'add', // 'add' alebo 'edit'
    onCancelEdit // Funkcia na zrušenie úprav
}) => {
  // --- Stavy Formulára ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY_VALUE);
  const [formError, setFormError] = useState(null); // Chyba špecifická pre tento formulár

  // --- Efekt na Predvyplnenie / Reset ---
  // Spustí sa vždy, keď sa zmení initialData alebo formMode
  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      // Edit mód: predvyplň dáta
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || ''); // amount je číslo, input potrebuje string
      setCategory(initialData.category || DEFAULT_CATEGORY_VALUE);
      setFormError(null); // Vyčisti predchádzajúce chyby
    } else {
      // Add mód (alebo ak chýbajú initialData v edit móde): resetuj polia
      setDescription('');
      setAmount('');
      setCategory(DEFAULT_CATEGORY_VALUE);
      setFormError(null); // Vyčisti predchádzajúce chyby
    }
  }, [initialData, formMode]);

  // --- Handler pre Odoslanie Formulára ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Zabráni štandardnému odoslaniu HTML formulára
    setFormError(null); // Reset chýb

    // --- Jednoduchá Validácia na Fronte ---
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
      setFormError("Suma musí byť platné kladné číslo (napr. 10.50).");
      return;
    }

    // --- Príprava Dát pre API ---
    const finalCategory = category === DEFAULT_CATEGORY_VALUE ? null : category;
    const expensePayload = {
      description: description.trim(),
      amount: parsedAmount,
      // Kategóriu pošli len ak je vybraná (nie je null), inak backend použije default
      ...(finalCategory !== null && { category: finalCategory })
    };

    // --- Volanie API (Add alebo Update) ---
    try {
      if (formMode === 'edit') {
        if (!initialData?.id) {
          setFormError("Chyba: Chýba ID pre úpravu záznamu."); // Nemalo by nastať
          return;
        }
        // Volanie funkcie z App.jsx na aktualizáciu
        await onExpenseUpdate(initialData.id, expensePayload);
        // Formulár sa nevyčistí, App.jsx ho skryje/zmení mód
      } else {
        // Volanie funkcie z App.jsx na pridanie
        await onExpenseAdd(expensePayload);
        // Vyčisti formulár len po úspešnom pridaní
        setDescription('');
        setAmount('');
        setCategory(DEFAULT_CATEGORY_VALUE);
      }
    } catch (apiError) {
      // --- Spracovanie Chýb z API ---
      const messages = apiError.response?.data?.messages;
      let errorMessage = `Nastala chyba pri ${formMode === 'edit' ? 'aktualizácii' : 'pridávaní'} výdavku.`; // Defaultná správa
      if (messages && typeof messages === 'object') {
        // Skús spojiť validačné chyby z Marshmallow
        errorMessage = Object.entries(messages)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
      } else if (apiError.response?.data?.error) {
        errorMessage = apiError.response.data.error; // Chyba z nášho API
      } else if (apiError.message) {
        errorMessage = apiError.message; // Všeobecná chyba (napr. network error)
      }
      setFormError(errorMessage);
      console.error(`Form Submit Error (${formMode} mode):`, apiError.response || apiError);
    }
  };

  // --- Dynamické Texty ---
  const isEditMode = formMode === 'edit';
  const submitButtonText = isEditMode ? 'Uložiť zmeny' : 'Pridať výdavok';
  const formTitle = isEditMode ? `Upraviť výdavok` : 'Pridať Nový Výdavok';

  // --- JSX Renderovanie ---
  return (
    <div className={`mb-6 p-4 bg-white rounded-lg shadow-md border ${isEditMode ? 'border-blue-400 ring-1 ring-blue-200' : 'border-transparent'}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">{formTitle}</h2>
      {/* Zobrazenie popisu upravovaného záznamu */}
      {isEditMode && initialData?.description && (
          <p className="text-sm text-gray-500 mb-3">Upravujete: <strong>{initialData.description}</strong> ({initialData.amount?.toFixed(2)} €)</p>
      )}
      {/* Formulár */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Zobrazenie chybovej správy */}
        {formError && (
          <div className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
            {formError}
          </div>
        )}

        {/* Popis */}
        <div className="mb-3">
          <label htmlFor={isEditMode ? 'edit-description' : 'add-description'} className="block text-sm font-medium text-gray-600 mb-1">
            Popis <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id={isEditMode ? 'edit-description' : 'add-description'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Napr. Nákup potravín"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            disabled={isProcessing}
            required
          />
        </div>

        {/* Riadok: Suma a Kategória */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Suma */}
          <div>
            <label htmlFor={isEditMode ? 'edit-amount' : 'add-amount'} className="block text-sm font-medium text-gray-600 mb-1">
              Suma (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id={isEditMode ? 'edit-amount' : 'add-amount'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              disabled={isProcessing}
              required
            />
          </div>
          {/* Kategória */}
          <div>
            <label htmlFor={isEditMode ? 'edit-category' : 'add-category'} className="block text-sm font-medium text-gray-600 mb-1">
              Kategória
            </label>
            <select
              id={isEditMode ? 'edit-category' : 'add-category'}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition duration-150"
              disabled={isProcessing}
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

        {/* Akčné Tlačidlá */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-4">
             {/* Tlačidlo Zrušiť (len v edit móde) */}
             {isEditMode && (
                 <button
                   type="button" // Dôležité: typ 'button' aby neodosielal formulár
                   onClick={onCancelEdit} // Zavolá funkciu z App.jsx
                   disabled={isProcessing} // Zablokuje sa počas spracovania
                   className={`w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                   Zrušiť
                 </button>
             )}
             {/* Tlačidlo Odoslať (Pridať / Uložiť zmeny) */}
            <button
              type="submit"
              className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out text-white ${
                  isEditMode
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' // Štýl pre edit
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' // Štýl pre add
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} // Štýl pre processing
              disabled={isProcessing}
            >
              {/* Text tlačidla sa mení podľa stavu */}
              {isProcessing ? (isEditMode ? 'Ukladám...' : 'Pridávam...') : submitButtonText}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;