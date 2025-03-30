import React, { useState, useEffect } from 'react';

// Kategórie pre výdavky (môžu byť importované)
const CATEGORIES = [
  "Potraviny", "Bývanie", "Doprava", "Zábava", "Oblečenie",
  "Zdravie", "Vzdelávanie", "Reštaurácie", "Úspory/Investície", "Ostatné"
];
const DEFAULT_CATEGORY_VALUE = "";

// Kategórie pre pravidlo 50/30/20
const RULE_CATEGORIES = ['Needs', 'Wants', 'Savings'];
const DEFAULT_RULE_CATEGORY_VALUE = ""; // Defaultne nevybrané

const ExpenseForm = ({
    onExpenseAdd,
    onExpenseUpdate,
    isProcessing,
    initialData = null,
    formMode = 'add',
    onCancelEdit
}) => {
  // Stavy pre polia formulára
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY_VALUE);
  const [ruleCategory, setRuleCategory] = useState(DEFAULT_RULE_CATEGORY_VALUE); // Nový stav
  const [formError, setFormError] = useState(null);

  // Efekt na predvyplnenie/reset formulára
  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      // Edit mód: naplň polia z initialData
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setCategory(initialData.category || DEFAULT_CATEGORY_VALUE);
      setRuleCategory(initialData.rule_category || DEFAULT_RULE_CATEGORY_VALUE); // Predvyplň aj rule category
      setFormError(null);
    } else {
      // Add mód: resetuj polia
      setDescription('');
      setAmount('');
      setCategory(DEFAULT_CATEGORY_VALUE);
      setRuleCategory(DEFAULT_RULE_CATEGORY_VALUE); // Resetuj aj rule category
      setFormError(null);
    }
  }, [initialData, formMode]); // Závislosti efektu

  // Handler pre odoslanie formulára
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    // Validácia
    if (!description.trim()) { setFormError("Popis nesmie byť prázdny."); return; }
    if (!amount) { setFormError("Suma je povinná."); return; }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setFormError("Suma musí byť platné kladné číslo."); return; }

    // Príprava dát pre API
    const finalCategory = category === DEFAULT_CATEGORY_VALUE ? null : category;
    const finalRuleCategory = ruleCategory === DEFAULT_RULE_CATEGORY_VALUE ? null : ruleCategory; // Priprav rule category

    const expensePayload = {
      description: description.trim(),
      amount: parsedAmount,
      ...(finalCategory !== null && { category: finalCategory }),
      ...(finalRuleCategory !== null && { rule_category: finalRuleCategory }) // Pridaj rule category do payloadu
    };

    // Volanie API (Add/Update)
    try {
      if (formMode === 'edit') {
        if (!initialData?.id) { setFormError("Chyba: Chýba ID výdavku."); return; }
        await onExpenseUpdate(initialData.id, expensePayload);
      } else {
        await onExpenseAdd(expensePayload);
        // Reset formulára len pri úspešnom pridaní
        setDescription('');
        setAmount('');
        setCategory(DEFAULT_CATEGORY_VALUE);
        setRuleCategory(DEFAULT_RULE_CATEGORY_VALUE); // Reset aj rule category
      }
    } catch (apiError) {
      // Spracovanie chýb z API
      const messages = apiError.response?.data?.messages;
      let errorMessage = `Nastala chyba pri ${formMode === 'edit' ? 'aktualizácii' : 'pridávaní'} výdavku.`;
      if (messages && typeof messages === 'object') {
          errorMessage = Object.entries(messages)
             .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
             .join('; ');
      } else if (apiError.response?.data?.error) { errorMessage = apiError.response.data.error; }
      else if (apiError.message) { errorMessage = apiError.message; }
      setFormError(errorMessage);
      console.error(`Expense Form Submit Error (${formMode}):`, apiError.response || apiError);
    }
  };

  // Dynamické texty
  const isEditMode = formMode === 'edit';
  const submitButtonText = isEditMode ? 'Uložiť zmeny' : 'Pridať výdavok';
  const formTitle = isEditMode ? 'Upraviť výdavok' : 'Pridať Nový Výdavok';

  return (
    <div className={`p-5 bg-white rounded-xl shadow-lg border transition-all duration-300 ease-in-out ${isEditMode ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200 hover:shadow-md'}`}>
        <h2 className="text-lg font-semibold mb-5 text-slate-800">{formTitle}</h2>
        {isEditMode && initialData?.description && (
            <p className="text-sm text-slate-500 mb-4">Upravujete: <strong className="text-slate-700">{initialData.description}</strong> ({initialData.amount?.toFixed(2)} €)</p>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {formError && (
                <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200" role="alert">
                    {formError}
                </div>
            )}

            {/* Popis */}
            <div>
                <label htmlFor={isEditMode ? 'edit-description' : 'add-description'} className="block text-xs font-medium text-slate-600 mb-1">Popis <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id={isEditMode ? 'edit-description' : 'add-description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Napr. Večera, Kino"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={isProcessing}
                    required
                />
            </div>

            {/* Suma & Kategória */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={isEditMode ? 'edit-amount' : 'add-amount'} className="block text-xs font-medium text-slate-600 mb-1">Suma (€) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id={isEditMode ? 'edit-amount' : 'add-amount'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out disabled:bg-slate-100 disabled:text-slate-500"
                        disabled={isProcessing}
                        required
                    />
                </div>
                <div>
                    <label htmlFor={isEditMode ? 'edit-category' : 'add-category'} className="block text-xs font-medium text-slate-600 mb-1">Kategória</label>
                    <select
                        id={isEditMode ? 'edit-category' : 'add-category'}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out appearance-none disabled:bg-slate-100 disabled:text-slate-500"
                        disabled={isProcessing}
                    >
                        <option value={DEFAULT_CATEGORY_VALUE}>-- Vyberte kategóriu --</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Rule Category */}
            <div>
                <label htmlFor={isEditMode ? 'edit-rule-category' : 'add-rule-category'} className="block text-xs font-medium text-slate-600 mb-1">
                  Typ výdavku (50/30/20)
                </label>
                <select
                  id={isEditMode ? 'edit-rule-category' : 'add-rule-category'}
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out appearance-none disabled:bg-slate-100 disabled:text-slate-500"
                  disabled={isProcessing}
                >
                  <option value={DEFAULT_RULE_CATEGORY_VALUE}>-- Priradiť neskôr --</option>
                  {RULE_CATEGORIES.map((rc) => (
                    <option key={rc} value={rc}>{rc}</option>
                  ))}
                </select>
             </div>

            {/* Tlačidlá */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-3">
                {isEditMode && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        disabled={isProcessing}
                        className={`w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        Zrušiť
                    </button>
                )}
                <button
                    type="submit"
                    className={`w-full sm:w-auto px-5 py-2 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out text-white ${
                        isEditMode
                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            : 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    disabled={isProcessing}
                >
                    {isProcessing ? (isEditMode ? 'Ukladám...' : 'Pridávam...') : submitButtonText}
                </button>
            </div>
        </form>
    </div>
  );
};

export default ExpenseForm;