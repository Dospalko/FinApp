import React, { useState, useEffect } from 'react';

// Zdroj príjmu ponecháme ako textové pole pre jednoduchosť
// Ak by si chcel fixné zdroje, definuj ich tu ako pole:
// const INCOME_SOURCES = ["Plat", "Brigáda", "Prenájom", "Dar", "Ostatné"];
// const DEFAULT_SOURCE_VALUE = "";

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
  const [source, setSource] = useState(''); // Pre textové pole
  // const [source, setSource] = useState(DEFAULT_SOURCE_VALUE); // Pre select
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (formMode === 'edit' && initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount?.toString() || '');
      setSource(initialData.source || ''); // Pre textové pole
      // setSource(initialData.source || DEFAULT_SOURCE_VALUE); // Pre select
      setFormError(null);
    } else {
      setDescription('');
      setAmount('');
      setSource(''); // Pre textové pole
      // setSource(DEFAULT_SOURCE_VALUE); // Pre select
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

    // const finalSource = source === DEFAULT_SOURCE_VALUE ? null : source; // Pre select
    const incomePayload = {
      description: description.trim(),
      amount: parsedAmount,
      ...(source.trim() && { source: source.trim() }) // Pre textové pole
      // ...(finalSource !== null && { source: finalSource }) // Pre select
    };

    try {
      if (formMode === 'edit') {
        if (!initialData?.id) { setFormError("Chyba: Chýba ID príjmu."); return; }
        await onIncomeUpdate(initialData.id, incomePayload);
      } else {
        await onIncomeAdd(incomePayload);
        setDescription('');
        setAmount('');
        setSource(''); // Pre textové pole
        // setSource(DEFAULT_SOURCE_VALUE); // Pre select
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
    <div className={`p-5 bg-white rounded-lg shadow border ${isEditMode ? 'border-green-400 ring-1 ring-green-200' : 'border-slate-200'}`}>
      <h2 className="text-xl font-semibold mb-4 text-slate-800">{formTitle}</h2>
       {isEditMode && initialData?.description && (
           <p className="text-sm text-gray-500 mb-3">Upravujete: <strong>{initialData.description}</strong> (+{initialData.amount?.toFixed(2)} €)</p>
       )}
      <form onSubmit={handleSubmit} noValidate>
        {formError && ( <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md border border-red-200" role="alert">{formError}</div> )}

        <div className="mb-4">
          <label htmlFor={isEditMode ? 'edit-income-desc' : 'add-income-desc'} className="block text-sm font-medium text-slate-700 mb-1">Popis <span className="text-red-500">*</span></label>
          <input type="text" id={isEditMode ? 'edit-income-desc' : 'add-income-desc'} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Napr. Výplata, Predaj na Bazoši" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" disabled={isProcessing} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor={isEditMode ? 'edit-income-amount' : 'add-income-amount'} className="block text-sm font-medium text-slate-700 mb-1">Suma (€) <span className="text-red-500">*</span></label>
            <input type="number" id={isEditMode ? 'edit-income-amount' : 'add-income-amount'} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0.01" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" disabled={isProcessing} required/>
          </div>
          <div>
            <label htmlFor={isEditMode ? 'edit-income-source' : 'add-income-source'} className="block text-sm font-medium text-slate-700 mb-1">Zdroj (nepovinné)</label>
            <input type="text" id={isEditMode ? 'edit-income-source' : 'add-income-source'} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Napr. Zamestnávateľ, Klient" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 ease-in-out" disabled={isProcessing}/>
             {/* Alebo select, ak máš INCOME_SOURCES: */}
             {/* <select id={isEditMode ? 'edit-income-source' : 'add-income-source'} value={source} onChange={(e) => setSource(e.target.value)} className="w-full ..." disabled={isProcessing}>
                 <option value={DEFAULT_SOURCE_VALUE}>-- Vyberte zdroj --</option>
                 {INCOME_SOURCES.map((src) => ( <option key={src} value={src}>{src}</option> ))}
             </select> */}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mt-4">
             {isEditMode && (
                 <button type="button" onClick={onCancelEdit} disabled={isProcessing} className={`w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>Zrušiť</button>
             )}
             <button type="submit" className={`w-full sm:w-auto px-4 py-2.5 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out text-white ${
                  isEditMode
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' // Edit = Zelená
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' // Add = Smaragdová
                } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
               disabled={isProcessing}>
               {isProcessing ? (isEditMode ? 'Ukladám...' : 'Pridávam...') : submitButtonText}
             </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;