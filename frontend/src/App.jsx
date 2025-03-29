// frontend/src/App.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Pridaný import useMemo
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
// Importuj aj nový filter komponent a konštantu
import CategoryFilter, { ALL_CATEGORIES_VALUE } from './components/CategoryFilter/CategoryFilter';
import { getExpenses, addExpense, pingBackend, deleteExpense } from './api/expenseApi';

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
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Finance Expense Tracker
        </h1>
        {showPing && (
            <p className={`text-center text-xs mt-1 p-1 rounded ${pingMessage.startsWith('Backend nedostupný') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {pingMessage}
            </p>
        )}
      </header>

      <main className="max-w-3xl mx-auto">
        <ExpenseForm onExpenseAdd={handleExpenseAdd} isAdding={isAdding} />
        {!isLoading && expenses.length > 0 && (
             <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                 <CategoryFilter
                     categories={availableCategories}
                     selectedCategory={selectedCategory}
                     onCategoryChange={handleCategoryChange}
                 />
             </div>
        )}
          <ExpenseList
          expenses={filteredExpenses} 
          isLoading={isLoading}
          error={listError}
          onDelete={handleExpenseDelete}
          deletingExpenseId={deletingExpenseId}
        />
      </main>

      <footer className="text-center mt-8 text-xs text-gray-400">
         Jednoduchý Expense Tracker - Prototyp
      </footer>
    </div>
  );
}

export default App;