// frontend/src/App.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Pridaný import useMemo
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
// Importuj aj nový filter komponent a konštantu
import CategoryFilter, { ALL_CATEGORIES_VALUE } from './components/CategoryFilter/CategoryFilter';
import { getExpenses, addExpense, pingBackend, deleteExpense } from './api/expenseApi';

import ExpenseChart from './components/ExpenseChart/ExpenseChart';
function App() {
  // --- Tvoje existujúce stavy ---
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [listError, setListError] = useState(null);
  const [pingMessage, setPingMessage] = useState("Testujem spojenie s backendom...");
  const [showPing, setShowPing] = useState(true);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  // --- NOVÝ STAV PRE FILTER ---
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE); // Predvolene zobraz všetky

  // --- Tvoje existujúce funkcie ---
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
       setListError(`Chyba pri načítaní výdavkov: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    pingBackend()
        .then(data => setPingMessage(data.message || "Backend je pripojený."))
        .catch(err => setPingMessage(`Backend nedostupný: ${err.response?.data?.error || err.message}`))
        .finally(() => {
            setTimeout(() => setShowPing(false), 5000);
        });
    fetchExpenses();
  }, [fetchExpenses]);


  const handleExpenseAdd = async (expenseData) => {
    setIsAdding(true);
    try {
        await addExpense(expenseData);
        // Fetch expenses, aby sa aktualizovali aj kategórie pre filter
        await fetchExpenses();
    } catch (error) {
        console.error("Failed to add expense (re-throwed in App):", error);
        throw error;
    } finally {
        setIsAdding(false);
    }
  };

  const handleExpenseDelete = async (expenseIdToDelete) => {
    setDeletingExpenseId(expenseIdToDelete);
    setListError(null);
    try {
        const status = await deleteExpense(expenseIdToDelete);
        if (status === 204) {
             // Fetch expenses, aby sa aktualizovali aj kategórie pre filter
            await fetchExpenses();
            // Alternatíva (neaktualizuje filter kategórií):
            // setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseIdToDelete));
            console.log(`Expense with ID ${expenseIdToDelete} deleted successfully.`);
        } else {
             setListError(`Nepodarilo sa vymazať výdavok (status: ${status}).`);
        }
    } catch (error) {
        console.error(`Failed to delete expense ID ${expenseIdToDelete}:`, error);
        setListError(`Chyba pri mazaní výdavku: ${error.response?.data?.error || error.message}`);
    } finally {
        setDeletingExpenseId(null);
    }
  };

  const availableCategories = useMemo(() => {
      const categories = new Set(
          expenses
              .map(exp => exp.category)
              .filter(cat => cat && cat !== 'Nezaradené')
      );
      return Array.from(categories).sort();
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
      if (selectedCategory === ALL_CATEGORIES_VALUE) {
          return expenses;
      }
      return expenses.filter(exp => exp.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const handleCategoryChange = (category) => {
      setSelectedCategory(category);
  };
     // --- NOVÉ: Spracovanie dát pre graf ---
  const categoryChartData = useMemo(() => {
    const totals = {}; // Objekt na ukladanie súčtov pre každú kategóriu

    // Prejdeme všetky výdavky (nie filtrované!)
    expenses.forEach(expense => {
      // Použijeme kategóriu, alebo 'Nezaradené' ak je null/undefined
      const category = expense.category || 'Nezaradené';
      if (totals[category]) {
        totals[category] += expense.amount;
      } else {
        totals[category] = expense.amount;
      }
    });

    // Prevedieme objekt totals na polia pre Chart.js
    const labels = Object.keys(totals);
    const data = Object.values(totals);

    // Zoradíme dáta od najväčšej sumy po najmenšiu (voliteľné, pre lepší prehľad v grafe)
    const sortedIndices = labels.map((_, index) => index).sort((a, b) => data[b] - data[a]);
    const sortedLabels = sortedIndices.map(index => labels[index]);
    const sortedData = sortedIndices.map(index => data[index]);


    // Vrátime objekt v požadovanom formáte
    return {
      // labels: labels,
      // data: data
      labels: sortedLabels,
      data: sortedData
    };
  }, [expenses]); // Závislosť len na 'expenses'
  // --- KONIEC SPRACOVANIA DÁT PRE GRAF ---
  return (
    // Zmena: Jemnejšie pozadie (slate-50), pridanie min-h-screen na vyplnenie výšky, jemné písmo
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {/* Zmena: Väčšie odsadenie na väčších obrazovkách */}
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-8 pb-4 border-b border-slate-200"> {/* Zmena: Jemnejšia farba border */}
          <h1 className="text-3xl font-bold text-center text-slate-900"> {/* Zmena: Tmavšia farba nadpisu */}
            Finance Expense Tracker
          </h1>
          {showPing && (
              // Zmena: Upravené farby pre ping status
              <p className={`text-center text-xs mt-2 p-1.5 rounded ${pingMessage.startsWith('Backend nedostupný') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {pingMessage}
              </p>
          )}
        </header>

        {/* Zmena: Možno trochu väčšia maximálna šírka */}
        <main className="max-w-4xl mx-auto space-y-6"> {/* Pridaný space-y pre medzery medzi sekciami */}
          {/* Formulár */}
          <ExpenseForm onExpenseAdd={handleExpenseAdd} isAdding={isAdding} />

          {/* Filter a Zoznam - Zabalíme do jedného divu pre lepšie medzery */}
          <div>
            {/* Filter kategórií */}
            {!isLoading && expenses.length > 0 && (
               <div className="bg-white p-4 rounded-t-lg shadow-md border border-slate-200 border-b-0"> {/* Mierne úpravy štýlu */}
                   <CategoryFilter
                       categories={availableCategories}
                       selectedCategory={selectedCategory}
                       onCategoryChange={handleCategoryChange}
                   />
               </div>
            )}

            {/* Zoznam výdavkov */}
            <ExpenseList
              expenses={filteredExpenses}
              isLoading={isLoading}
              error={listError}
              onDelete={handleExpenseDelete}
              deletingExpenseId={deletingExpenseId}
              // Pridáme prop, aby sme vedeli, či je filter zobrazený (pre zaoblenie rohov)
              filterVisible={!isLoading && expenses.length > 0}
            />
          </div>
               {/* Zobrazíme, ak nie je loading a sú nejaké dáta pre graf */}
               {!isLoading && categoryChartData.labels.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 text-center">Prehľad výdavkov</h2>
                <ExpenseChart chartData={categoryChartData} />
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-xs text-slate-400"> {/* Zmena: Farba pätičky */}
           Jednoduchý Expense Tracker © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

export default App;