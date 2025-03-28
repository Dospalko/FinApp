import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importuj axios

// Nastav základnú URL pre API (môžeš dať aj do .env)
const API_BASE_URL = 'http://localhost:5000/api'; // Predpokladáme, že Flask beží na porte 5000

function App() {
  const [message, setMessage] = useState("Načítavam...");
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  // Načítanie správy z /api/ping pri prvom rendrovaní
  useEffect(() => {
    axios.get(`${API_BASE_URL}/ping`)
      .then(response => {
        setMessage(response.data.message || "Backend odpovedal.");
      })
      .catch(err => {
        console.error("Chyba pri pingu:", err);
        setMessage("Chyba pri spojení s backendom.");
        setError("Nepodarilo sa načítať stav backendu. Beží na porte 5000?");
      });
  }, []); // Prázdne pole znamená, že sa useEffect spustí len raz po montáži

   // Načítanie výdavkov
  useEffect(() => {
    fetchExpenses();
  }, []); // Načítať pri prvom rendrovaní

  const fetchExpenses = () => {
    axios.get(`${API_BASE_URL}/expenses`)
      .then(response => {
        setExpenses(response.data);
        setError(null); // Vymazať chybu ak bolo načítanie úspešné
      })
      .catch(err => {
        console.error("Chyba pri načítaní výdavkov:", err);
        setError("Nepodarilo sa načítať výdavky z API.");
      });
  };

  // Tu neskôr pridáme formulár na pridávanie výdavkov

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Finance Expense Tracker
      </h1>
      <p className="mb-4 p-2 bg-blue-100 border border-blue-300 rounded">
        Backend status: <span className="font-semibold">{message}</span>
      </p>

      {/* Sekcia pre pridanie výdavku (zatiaľ len placeholder) */}
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Pridať Výdavok</h2>
        {/* Sem príde formulár */}
        <p className="text-gray-500">(Formulár bude pridaný neskôr)</p>
      </div>

      {/* Sekcia pre zobrazenie výdavkov */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Zoznam Výdavkov</h2>
        {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-2">{error}</p>}
        {expenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.map(expense => (
              <li key={expense.id} className="p-2 border rounded flex justify-between items-center">
                <span>{expense.description} ({expense.category})</span>
                <span className="font-medium text-red-600">{expense.amount.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        ) : (
          !error && <p className="text-gray-500">Zatiaľ žiadne výdavky.</p>
        )}
      </div>

    </div>
  );
}

export default App;