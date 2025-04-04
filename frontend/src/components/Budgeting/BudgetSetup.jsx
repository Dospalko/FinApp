import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getBudgetStatus, setBudget } from '../../api/budgetApi';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';

// Komponenta ProgressBar – vizuálne zobrazenie percentuálneho stavu rozpočtu s tooltipom
const ProgressBar = ({ percentage, budgeted, spent }) => {
  const cappedPercentage = Math.min(percentage, 100); // Vizualizácia obmedzená na 100%
  const overBudget = percentage > 100;
  const percentageDisplay = Math.round(percentage);

  let bgColor = 'bg-emerald-500'; // Zelená pre menej ako 80%
  if (percentage >= 80 && percentage <= 100) {
    bgColor = 'bg-amber-500'; // Oranžová pre 80-100%
  } else if (overBudget) {
    bgColor = 'bg-red-500'; // Červená pre prekročenie 100%
  }

  const tooltipText = overBudget
    ? `Prekročené o ${(spent - budgeted).toFixed(2)} € (${percentageDisplay}%)`
    : `${percentageDisplay}% z ${budgeted.toFixed(2)} €`;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 relative group my-1">
      <div
        className={`h-2.5 rounded-full ${bgColor} transition-all duration-500 ease-out`}
        style={{ width: `${cappedPercentage}%` }}
      ></div>
      {/* Tooltip, ktorý sa zobrazí pri hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
        {tooltipText}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
      </div>
    </div>
  );
};

// Predvolené kategórie – môžeš ich upraviť podľa potreby
const DEFAULT_BUDGET_CATEGORIES = [
  "Potraviny",
  "Bývanie",
  "Doprava",
  "Účty a Služby",
  "Osobné výdavky",
  "Zdravie",
  "Oblečenie",
  "Reštaurácie a Kaviarne",
  "Zábava a Voľný čas",
  "Vzdelávanie",
  "Darčeky a Dobročinnosť",
  "Dovolenka",
  "Úspory a Investície",
  "Ostatné",
];

// BudgetCard – karta pre jednu kategóriu
const BudgetCard = ({ category, data, onSliderChange, expenses }) => {
  // Stav pre rozbalenie/zbalenie zoznamu výdavkov
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);

  // Získame základné údaje; ak nie sú, prednastavíme default hodnotu 50 €
  const budgeted = data ? data.budgeted_amount : 50;
  const spent = data ? data.spent_amount : 0;
  const percentage = data ? data.percentage_spent : 0;

  // Filter výdavkov pre aktuálnu kategóriu
  const categoryExpenses = expenses.filter(expense => expense.category === category);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
        <button onClick={toggleOpen} className="text-sm text-blue-600 hover:underline">
          {isOpen ? 'Skryť výdavky' : 'Zobraziť výdavky'}
        </button>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-700">Rozpočet: {budgeted.toFixed(2)} €</span>
          <span className="text-sm text-gray-600">Vyčerpané: {spent.toFixed(2)} €</span>
        </div>
        {/* Slider pre zmenu rozpočtu */}
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={budgeted}
          onChange={(e) => onSliderChange(category, e.target.value)}
          className="w-full mb-2"
        />
        {/* ProgressBar ukazujúci využitie rozpočtu */}
        <ProgressBar percentage={percentage} budgeted={budgeted} spent={spent} />
      </div>
      {/* Rozbaliteľný zoznam výdavkov */}
      {isOpen && (
        <div className="mt-4 border-t pt-4">
          {categoryExpenses.length > 0 ? (
            <>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Výdavky:</h4>
              <ul className="space-y-2">
                {categoryExpenses.map(expense => (
                  <li key={expense.id} className="flex justify-between text-base text-gray-600 border-b pb-1">
                    <span className="truncate">{expense.description || 'Bez popisu'}</span>
                    <span>{expense.amount.toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-base text-gray-500">Žiadne výdavky pre túto kategóriu.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Hlavná komponenta BudgetSetup, ktorá "spája" všetky karty
const BudgetSetup = ({ selectedYear, selectedMonth, allExpenseCategories = [], expenses = [] }) => {
  // Kombinácia predvolených kategórií a dodaných kategórií z výdavkov
  const availableCategories = useMemo(() => {
    const combined = new Set([...DEFAULT_BUDGET_CATEGORIES, ...allExpenseCategories]);
    return [...combined].sort((a, b) => a.localeCompare(b));
  }, [allExpenseCategories]);

  // Stav rozpočtov, načítaných z API
  const [budgetStatus, setBudgetStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Ref pre debounce timeouty pri zmene slidera
  const debounceTimeoutsRef = useRef({});

  // Funkcia na načítanie stavu rozpočtov z API
  const fetchBudgetStatus = useCallback(async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const data = await getBudgetStatus(selectedYear, selectedMonth);
      // Transformujeme pole do objektu pre jednoduchšiu prácu
      const statusObj = {};
      data.forEach(item => {
        statusObj[item.category] = { ...item };
      });
      // Pre kategórie, ktoré nemajú nastavený rozpočet, nastavíme predvolených 50 €
      availableCategories.forEach(category => {
        if (!statusObj[category]) {
          statusObj[category] = {
            category,
            spent_amount: 0,
            budgeted_amount: 50,
            remaining_amount: 50,
            percentage_spent: 0,
          };
        }
      });
      setBudgetStatus(statusObj);
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || 'Chyba pri načítaní stavu rozpočtov.');
      console.error("Fetch Budget Status Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, availableCategories]);

  useEffect(() => {
    fetchBudgetStatus();
  }, [fetchBudgetStatus]);

  // Funkcia, ktorá spracováva zmenu hodnoty slidera
  const handleSliderChange = (category, newBudgetValue) => {
    setBudgetStatus(prev => {
      const prevData = prev[category];
      const spent = prevData ? prevData.spent_amount : 0;
      const updatedBudget = parseFloat(newBudgetValue);
      const percentage = updatedBudget > 0 ? (spent / updatedBudget) * 100 : 0;
      return {
        ...prev,
        [category]: {
          ...prevData,
          budgeted_amount: updatedBudget,
          remaining_amount: updatedBudget - spent,
          percentage_spent: percentage,
        }
      };
    });

    // Použijeme debounce (500ms) na API volanie
    if (debounceTimeoutsRef.current[category]) {
      clearTimeout(debounceTimeoutsRef.current[category]);
    }
    debounceTimeoutsRef.current[category] = setTimeout(async () => {
      try {
        await setBudget({
          category,
          amount: parseFloat(newBudgetValue),
          month: selectedMonth,
          year: selectedYear
        });
        fetchBudgetStatus();
      } catch (err) {
        console.error(`Error saving budget for ${category}:`, err);
        setGlobalError(`Chyba pri ukladaní rozpočtu pre ${category}.`);
      }
    }, 500);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Rozpočet a Stav</h2>
        <span className="text-sm font-medium text-gray-500">{selectedMonth}/{selectedYear}</span>
      </div>

      {globalError && (
        <Alert type="error" message={globalError} onClose={() => setGlobalError(null)} />
      )}

      <div className="flex-grow overflow-y-auto pr-1 space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-10">
            <Spinner size="md" color="border-purple-600" />
          </div>
        ) : (
          availableCategories.map(category => (
            <BudgetCard 
              key={category}
              category={category}
              data={budgetStatus[category]}
              onSliderChange={handleSliderChange}
              expenses={expenses}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetSetup;
