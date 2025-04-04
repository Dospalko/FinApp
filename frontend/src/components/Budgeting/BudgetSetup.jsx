import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { getBudgets, setBudget } from '../../api/budgetApi';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';

// --- DEFINÍCIA ZÁKLADNÝCH KATEGÓRIÍ ---
// Tento zoznam môžete upraviť podľa potreby
const DEFAULT_BUDGET_CATEGORIES = [
  "Potraviny",
  "Bývanie", // Náklady na bývanie (nájom, hypotéka, energie)
  "Doprava", // (Auto, MHD, palivo)
  "Účty a Služby", // (Telefón, internet, poistky, predplatné)
  "Osobné výdavky", // (Hygiena, kozmetika)
  "Zdravie", // (Lekár, lieky, doplnky)
  "Oblečenie",
  "Reštaurácie a Kaviarne",
  "Zábava a Voľný čas", // (Kultúra, šport, koníčky)
  "Vzdelávanie",
  "Darčeky a Dobročinnosť",
  "Dovolenka",
  "Úspory a Investície", // Ak chcete sledovať plánované úspory ako rozpočet
  "Ostatné",
];
// -------------------------------------

const BudgetSetup = ({ selectedYear, selectedMonth, allExpenseCategories = [] }) => {

  // --- KOMBINOVANIE KATEGÓRIÍ ---
  // Zoberieme predvolené a pridáme tie, ktoré prišli z hooku (z reálnych výdavkov),
  // zabezpečíme unikátnosť a zoradíme ich.
  const availableCategories = useMemo(() => {
      const combined = new Set([...DEFAULT_BUDGET_CATEGORIES, ...allExpenseCategories]);
      return [...combined].sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  }, [allExpenseCategories]);
  // -----------------------------

  const [budgets, setBudgets] = useState({}); // Stored budgets { category: amount }
  const [inputs, setInputs] = useState({});   // Input values { category: stringValue }
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const initializeInputs = useCallback((fetchedBudgetMap) => {
      const initialInputs = availableCategories.reduce((acc, category) => {
        acc[category] = fetchedBudgetMap[category] !== undefined ? fetchedBudgetMap[category].toString() : '';
        return acc;
      }, {});
      setInputs(initialInputs);
  }, [availableCategories]); // Závislosť na availableCategories je dôležitá


  const fetchBudgets = useCallback(async () => {
    // Už nekontrolujeme dĺžku availableCategories, lebo máme predvolené
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const fetchedBudgets = await getBudgets(selectedYear, selectedMonth);
      const budgetMap = fetchedBudgets.reduce((acc, budget) => {
        // Store only if the category is in our final list (prevents old/deleted categories from API)
        if (availableCategories.includes(budget.category)) {
             acc[budget.category] = budget.amount;
        }
        return acc;
      }, {});
      setBudgets(budgetMap);
      initializeInputs(budgetMap);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Chyba pri načítaní rozpočtov.');
      console.error("Fetch Budgets Error:", err);
      initializeInputs({});
    } finally {
      setIsLoading(false);
    }
    // Zmenená závislosť - availableCategories sa môže meniť
  }, [selectedYear, selectedMonth, initializeInputs, availableCategories]);

  useEffect(() => {
    // Ak sa zmenia dostupné kategórie (napr. pribudne nová z výdavkov), reinicializuj inputy
    // ale nezapíš to hneď ako zmenu rozpočtu, iba predvyplň
    initializeInputs(budgets);
  }, [availableCategories, initializeInputs, budgets]);


  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]); // fetchBudgets už zahŕňa svoje závislosti


  const handleInputChange = (category, value) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setInputs(prevInputs => ({
      ...prevInputs,
      [category]: sanitizedValue
    }));
    if (successMessage) setSuccessMessage('');
    if (error) setError(null);
  };

  const handleSaveBudgets = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');
    let hasError = false;
    const operations = [];

    for (const category of availableCategories) {
      const amountStr = inputs[category]?.trim() ?? '';
      const currentBudget = budgets[category];
      let targetAmount = null;

      if (amountStr !== '') {
         const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount < 0) {
             setError(`Neplatná suma pre kategóriu "${category}". Zadajte kladné číslo.`);
             hasError = true;
             break;
          }
          targetAmount = amount;
      }

       // Handle potential floating point comparison issues
       const currentBudgetNum = currentBudget !== undefined ? parseFloat(currentBudget) : undefined;
       const targetAmountNum = targetAmount !== null ? parseFloat(targetAmount) : null;

       // Determine if API call is needed:
       // 1. Input is not empty and differs from stored value (or stored value doesn't exist)
       // 2. Input is empty, but a stored value exists (meaning we might want to delete/set to 0)
       const epsilon = 0.001; // Tolerance for float comparison
       const valuesDiffer = targetAmountNum !== null && (currentBudgetNum === undefined || Math.abs(targetAmountNum - currentBudgetNum) > epsilon);
       const shouldDelete = targetAmountNum === null && currentBudgetNum !== undefined && currentBudgetNum !== 0; // Only delete if it was previously non-zero

      if (valuesDiffer || shouldDelete) {
         const budgetData = {
           category: category,
           amount: targetAmountNum ?? 0, // Send 0 if input is empty/null
           month: selectedMonth,
           year: selectedYear
         };
         operations.push(setBudget(budgetData).catch(err => {
             console.error(`Error saving budget for ${category}:`, err);
             setError(prev => prev ? `${prev}\nChyba pre "${category}"` : `Chyba pri ukladaní pre "${category}".`);
             hasError = true; // Mark that an error occurred
         }));
      }
    }

    if (hasError) {
        setIsSaving(false);
        return;
    }

    // Execute all API calls concurrently
    try {
        await Promise.all(operations);
    } catch (aggregateError) {
        // This catch might not be strictly necessary if individual catches handle 'hasError'
        console.error("Error during bulk budget save:", aggregateError)
        // hasError should already be true from individual catches
    }


    setIsSaving(false);
    if (!hasError) { // Check if any individual error occurred
        setSuccessMessage('Rozpočty boli úspešne aktualizované!');
        fetchBudgets(); // Re-fetch to confirm and update state
        setTimeout(() => setSuccessMessage(''), 4000);
    }
  };


  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
        <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
                Nastaviť Rozpočty
            </h2>
             <span className="text-sm font-medium text-gray-500">
                {selectedMonth}/{selectedYear}
            </span>
        </div>

        <div className="mb-4 space-y-2">
             {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
             {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
        </div>

        <div className="flex-grow overflow-y-auto pr-1">
            {isLoading && (
                <div className="flex justify-center items-center h-full py-10">
                    <Spinner size="md" color="border-purple-600"/>
                </div>
            )}

            {/* Show categories even if loading is finished but list is empty (shouldn't happen with defaults) */}
             {!isLoading && availableCategories.length === 0 && (
                 <div className="text-center py-10 text-gray-500">
                     <p>Neboli nájdené žiadne kategórie na nastavenie rozpočtu.</p>
                 </div>
             )}

            {!isLoading && availableCategories.length > 0 && (
                <div className="space-y-3">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center justify-between space-x-3">
                      <label
                        htmlFor={`budget-${category}`}
                        className="text-sm font-medium text-gray-600 w-2/5 truncate hover:text-clip hover:overflow-visible"
                        title={category}
                       >
                        {category}
                      </label>
                      <div className="relative w-3/5">
                         <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-sm pointer-events-none">€</span>
                         <input
                            type="text"
                            inputMode="decimal"
                            id={`budget-${category}`}
                            value={inputs[category] || ''}
                            onChange={(e) => handleInputChange(category, e.target.value)}
                            placeholder="0.00"
                            className={`
                                w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm
                                text-right bg-gray-50 border-gray-300
                                focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                                transition duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            disabled={isSaving || isLoading}
                         />
                      </div>
                    </div>
                  ))}
                </div>
            )}
        </div>

        {!isLoading && availableCategories.length > 0 && (
            <div className="pt-5 mt-auto text-right border-t border-gray-100">
                 <button
                    onClick={handleSaveBudgets}
                    disabled={isLoading || isSaving}
                    className={`
                        inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm
                        text-sm font-medium text-white
                        bg-cyan-700 hover:bg-cyan-800
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600
                        transition duration-150 ease-in-out
                        disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                >
                    {isSaving ? (
                        <>
                            <Spinner size="sm" color="border-white" />
                            <span className="ml-2">Ukladám...</span>
                        </>
                    ) : (
                        'Uložiť Zmeny'
                    )}
                </button>
            </div>
        )}
    </div>
  );
};

export default BudgetSetup;