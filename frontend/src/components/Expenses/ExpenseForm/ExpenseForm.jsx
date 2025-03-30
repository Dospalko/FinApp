import React, { useState, useEffect } from 'react';

// Kategórie zostávajú rovnaké
const CATEGORIES = [
  "Potraviny", "Bývanie", "Doprava", "Zábava", "Oblečenie",
  "Zdravie", "Vzdelávanie", "Reštaurácie", "Úspory/Investície", "Ostatné"
];
const DEFAULT_CATEGORY_VALUE = "";

const ExpenseForm = ({
    onExpenseAdd,
    onExpenseUpdate,
    isProcessing,
    initialData = null,
    formMode = 'add',
    onCancelEdit
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY_VALUE);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setCategory(initialData.category || DEFAULT_CATEGORY_VALUE);
      setFormError(null);
    } else {
      setDescription('');
      setAmount('');
      setCategory(DEFAULT_CATEGORY_VALUE);
      setFormError(null);
    }
  }, [initialData, formMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!description.trim()) { setFormError("Popis nesmie byť prázdny."); return; }
    if (!amount) { setFormError("Suma je povinná."); return; }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setFormError("Suma musí byť platné kladné číslo."); return; }

    const finalCategory = category === DEFAULT_CATEGORY_VALUE ? null : category;
    const expensePayload = {
      description: description.trim(),
      amount: parsedAmount,
      ...(finalCategory !== null && { category: finalCategory })
    };

    try {
      if (formMode === 'edit') {
        if (!initialData?.id) { setFormError("Chyba: Chýba ID výdavku."); return; }
        await onExpenseUpdate(initialData.id, expensePayload);
      } else {
        await onExpenseAdd(expensePayload);
        setDescription('');
        setAmount('');
        setCategory(DEFAULT_CATEGORY_VALUE);
      }
    } catch (apiError) {
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

  const isEditMode = formMode === 'edit';
  // Použijeme tmavšiu modrú/fialovú pre výdavky
  const submitButtonText = isEditMode ? 'Uložiť zmeny' : 'Pridať výdavok';
  const formTitle = isEditMode ? 'Upraviť výdavok' : 'Pridať Nový Výdavok';

  return (
    // Použijeme tmavšie pozadie pre celý formulár (napr. slate-800) a svetlý text
    // ALEBO ostaneme pri svetlom dizajne s tmavými prvkami - skúsime svetlý
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
                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' // Tmavšia modro-fialová pre edit
                            : 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500' // Fialová pre add
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