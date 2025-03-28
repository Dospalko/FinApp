// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
import { getExpenses, addExpense, pingBackend, deleteExpense } from './api/expenseApi'; // Používame opravené API

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [listError, setListError] = useState(null); // Premenované pre jasnoť
  const [pingMessage, setPingMessage] = useState("Testujem spojenie s backendom...");
  const [showPing, setShowPing] = useState(true); // Pre možnosť skrytia pingu
  const [deletingExpenseId, setDeletingExpenseId] = useState(null); 
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
    // Test backendu pri štarte
    pingBackend()
        .then(data => setPingMessage(data.message || "Backend je pripojený."))
        .catch(err => setPingMessage(`Backend nedostupný: ${err.response?.data?.error || err.message}`))
        .finally(() => {
            // Skry správu po pár sekundách
            setTimeout(() => setShowPing(false), 5000);
        });

    fetchExpenses();
  }, [fetchExpenses]);


  const handleExpenseAdd = async (expenseData) => {
    setIsAdding(true);
    try {
        await addExpense(expenseData);
        // Po úspešnom pridaní znova načítame celý zoznam
        await fetchExpenses();
    } catch (error) {
        // Chyba je už spracovaná vo formulári (nastaví setFormError),
        // ale musíme ju tu 're-throw', aby sme signalizovali neúspech
        console.error("Failed to add expense (re-throwed in App):", error);
        throw error; // Posunieme chybu do ExpenseForm
    } finally {
        setIsAdding(false);
    }
  };
  const handleExpenseDelete = async (expenseIdToDelete) => {
    setDeletingExpenseId(expenseIdToDelete); // Nastav ID mazanej položky (pre UI feedback)
    setListError(null); // Resetuj chybu zoznamu
    try {
        const status = await deleteExpense(expenseIdToDelete);
        if (status === 204) { // Ak API vrátilo úspech (No Content)
            // Aktualizuj stav - odstráň položku zo zoznamu
            // Efektívnejšie ako re-fetch celého zoznamu
            setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseIdToDelete));
            console.log(`Expense with ID ${expenseIdToDelete} deleted successfully.`);
            // Alternatíva: await fetchExpenses(); // Znova načíta celý zoznam
        } else {
            // Toto by nemalo nastať pri 204, ale pre istotu
             setListError(`Nepodarilo sa vymazať výdavok (status: ${status}).`);
        }
    } catch (error) {
        console.error(`Failed to delete expense ID ${expenseIdToDelete}:`, error);
        setListError(`Chyba pri mazaní výdavku: ${error.response?.data?.error || error.message}`);
    } finally {
        setDeletingExpenseId(null); // Resetuj ID mazanej položky po dokončení
    }
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
        <ExpenseList
          expenses={expenses}
          isLoading={isLoading}
          error={listError}
          onDelete={handleExpenseDelete} // Poskytnutie funkcie na mazanie
          deletingExpenseId={deletingExpenseId} // Poskytnutie ID mazanej položky
        />
      </main>

      <footer className="text-center mt-8 text-xs text-gray-400">
         Jednoduchý Expense Tracker - Prototyp
      </footer>
    </div>
  );
}

export default App;