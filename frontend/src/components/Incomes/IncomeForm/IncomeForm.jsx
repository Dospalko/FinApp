import React, { useState, useEffect } from 'react';

const IncomeForm = ({
    onIncomeAdd,
    onIncomeUpdate,
    isProcessing,
    initialData = null,
    formMode = 'add',
    onCancelEdit
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setSource(initialData.source || '');
      setFormError(null);
    } else {
      setDescription('');
      setAmount('');
      setSource('');
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

    const incomePayload = {
      description: description.trim(),
      amount: parsedAmount,
      ...(source.trim() && { source: source.trim() })
    };

    try {
      if (formMode === 'edit') {
        if (!initialData?.id) { setFormError("Chyba: Chýba ID príjmu."); return; }
        await onIncomeUpdate(initialData.id, incomePayload);
      } else {
        await onIncomeAdd(incomePayload);
        setDescription('');
        setAmount('');
        setSource('');
      }
    } catch (apiError) {
        const messages = apiError.response?.data?.messages;
        let errorMessage = `Nastala chyba pri ${formMode === 'edit' ? 'aktualizácii' : 'pridávaní'} príjmu.`;
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
        console.error(`Income Form Submit Error (${formMode}):`, apiError.response || apiError);
    }
  };

  const isEditMode = formMode === 'edit';
  const submitButtonText = isEditMode ? 'Uložiť zmeny' : 'Pridať príjem';
  const formTitle = isEditMode ? 'Upraviť príjem' : 'Pridať Nový Príjem';

  return (
    <div className={`p-5 bg-white rounded-xl shadow-lg border transition-all duration-300 ease-in-out ${isEditMode ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200 hover:shadow-md'}`}>
      <h2 className="text-lg font-semibold mb-5 text-slate-800">{formTitle}</h2>
       {isEditMode && initialData?.description && (
           <p className="text-sm text-slate-500 mb-4">Upravujete: <strong className="text-slate-700">{initialData.description}</strong> (+{initialData.amount?.toFixed(2)} €)</p>
       )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200" role="alert">
                {formError}
            </div>
         )}

        <div>
          <label htmlFor={isEditMode ? 'edit-income-desc' : 'add-income-desc'} className="block text-xs font-medium text-slate-600 mb-1">Popis <span className="text-red-500">*</span></label>
          <input
            type="text"
            id={isEditMode ? 'edit-income-desc' : 'add-income-desc'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Napr. Plat, Dividendy"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out disabled:bg-slate-50 disabled:text-slate-500"
            disabled={isProcessing}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={isEditMode ? 'edit-income-amount' : 'add-income-amount'} className="block text-xs font-medium text-slate-600 mb-1">Suma (€) <span className="text-red-500">*</span></label>
            <input
              type="number"
              id={isEditMode ? 'edit-income-amount' : 'add-income-amount'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out disabled:bg-slate-50 disabled:text-slate-500"
              disabled={isProcessing}
              required
            />
          </div>
          <div>
            <label htmlFor={isEditMode ? 'edit-income-source' : 'add-income-source'} className="block text-xs font-medium text-slate-600 mb-1">Zdroj (nepovinné)</label>
            <input
              type="text"
              id={isEditMode ? 'edit-income-source' : 'add-income-source'}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Napr. Zamestnávateľ, Klient"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out disabled:bg-slate-50 disabled:text-slate-500"
              disabled={isProcessing}
            />
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
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' // Zelená pre edit
                    : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400' // Svetlejšia zelená pre add
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

export default IncomeForm;