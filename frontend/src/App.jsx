// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm/ExpenseForm';
import ExpenseList from './components/ExpenseList/ExpenseList';
import { getExpenses, addExpense, pingBackend } from './api/expenseApi'; // Import API funkcií

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Stav načítania pre zoznam
  const [isAdding, setIsAdding] = useState(false); // Stav prebiehajúceho pridávania
  const [error, setError] = useState(null); // Chyba pri načítaní zoznamu
  const [pingMessage, setPingMessage] = useState("Testujem backend...");

  // Funkcia na načítanie výdavkov (použijeme useCallback pre optimalizáciu)
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(`Chyba pri načítaní výdavkov: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // Prázdne pole závislostí - funkcia sa nemení

  // Načítanie dát pri prvom rendrovaní
  useEffect(() => {
    // Test backendu
    pingBackend()
        .then(data => setPingMessage(data.message || "Backend OK"))
        .catch(err => setPingMessage(`Backend nedostupný: ${err.message}`));

    // Načítanie výdavkov
    fetchExpenses();
  }, [fetchExpenses]); // Zavolaj fetchExpenses pri montáži (a ak by sa funkcia zmenila)


  // Funkcia na spracovanie pridania výdavku (posielaná do ExpenseForm)
  const handleExpenseAdd = async (expenseData) => {
    setIsAdding(true);
    try {
        // Zavoláme API funkciu addExpense
        // Nemusíme ani spracovať vrátený objekt, ak nechceme
        await addExpense(expenseData);
        // Po úspešnom pridaní znova načítame celý zoznam
        await fetchExpenses(); // Jednoduchý spôsob aktualizácie
        // Alternatíva: manuálne pridať vrátený záznam do stavu 'expenses' bez re-fetchu
    } catch (error) {
        console.error("Failed to add expense in App:", error);
        // Chyba sa spracuje a zobrazí v ExpenseForm, ale môžeme ju aj tu zalogovať
        // Ak by sme chceli zobraziť globálnu chybu, nastavili by sme tu setError
        throw error; // Posunieme chybu späť do ExpenseForm, aby ju mohol zobraziť
    } finally {
        setIsAdding(false);
    }
  };

  return (
    // Použijeme Tailwind triedy pre základné rozloženie a pozadie
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <header className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Finance Expense Tracker
        </h1>
        <p className="text-center text-sm text-gray-500 mt-1">{pingMessage}</p>
      </header>

      <main>
        {/* Formulár teraz používa svoj stav pre loading/error */}
        <ExpenseForm onExpenseAdd={handleExpenseAdd} isAdding={isAdding} />

        {/* Zoznam zobrazuje stav načítania a chyby z App */}
        <ExpenseList
          expenses={expenses}
          isLoading={isLoading && !error} // Zobraz loading len ak nie je chyba
          error={error}
        />
      </main>
    </div>
  );
}

export default App;