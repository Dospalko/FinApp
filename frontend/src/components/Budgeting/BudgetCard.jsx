import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../UI/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Komponenta ProgressBar – zobrazuje percentuálne využitie rozpočtu s tooltipom
const ProgressBar = ({ percentage, budgeted, spent }) => {
  const cappedPercentage = Math.min(percentage, 100);
  const overBudget = percentage > 100;
  const percentageDisplay = Math.round(percentage);
  let bgColor = 'bg-emerald-500';
  if (percentage >= 80 && percentage <= 100) {
    bgColor = 'bg-amber-500';
  } else if (overBudget) {
    bgColor = 'bg-red-500';
  }
  const tooltipText = overBudget
    ? `Prekročené o ${(spent - budgeted).toFixed(2)} € (${percentageDisplay}%)`
    : `${percentageDisplay}% z ${budgeted.toFixed(2)} €`;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 relative group my-1">
      <div
        className={`h-2.5 rounded-full ${bgColor} transition-all duration-300 ease-out`}
        style={{ width: `${cappedPercentage}%` }}
      ></div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
        {tooltipText}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
      </div>
    </div>
  );
};

// Varianty pre animáciu zoznamu výdavkov
const listVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeInOut' } }
};

// BudgetCard – karta pre jednu kategóriu
const BudgetCard = ({ category, budgetData, categoryExpenses = [], onBudgetChange, isSaving }) => {
  // Stav pre rozbalenie/zbalenie výdavkov
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);

  // Získanie aktuálnych údajov; ak nie sú, použijeme default hodnotu 0
  const currentBudgetedAmount = budgetData?.budgeted_amount ?? 0;
  const spent = budgetData?.spent_amount ?? 0;
  const percentage = currentBudgetedAmount > 0 ? Math.round((spent / currentBudgetedAmount) * 100) : 0;
  const remaining = (budgetData?.remaining_amount !== undefined)
    ? budgetData.remaining_amount
    : (currentBudgetedAmount - spent);

  // Lokálny stav pre číselný vstup, aby sa nevolalo API po každom čísle
  const [localBudget, setLocalBudget] = useState(currentBudgetedAmount);

  useEffect(() => {
    setLocalBudget(currentBudgetedAmount);
  }, [currentBudgetedAmount]);

  const handleInputChange = (event) => {
    setLocalBudget(parseFloat(event.target.value) || 0);
  };

  const handleUpdate = () => {
    if (localBudget !== currentBudgetedAmount) {
      onBudgetChange(category, localBudget);
    }
  };

  const handleBlur = () => {
    if (localBudget !== currentBudgetedAmount) {
      onBudgetChange(category, localBudget);
    }
  };

  return (
    <motion.div
      layout="position"
      className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex flex-col"
    >
      {/* Hlavička s názvom kategórie */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-bold text-gray-800 truncate" title={category}>
          {category}
        </h3>
        {isSaving && <Spinner size="sm" color="border-indigo-500" />}
      </div>

      {/* Vstup pre zmenu rozpočtu s tlačidlom na aktualizáciu */}
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={localBudget}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded p-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            disabled={isSaving}
          />
          {localBudget !== currentBudgetedAmount && (
            <button
              onClick={handleUpdate}
              className="bg-indigo-500 text-white rounded px-3 py-1 text-sm hover:bg-indigo-600 transition"
              disabled={isSaving}
            >
              Upraviť
            </button>
          )}
        </div>
      </div>

      {/* ProgressBar a zobrazenie utratených/zostávajúcich prostriedkov */}
      <div className="mb-2">
        <ProgressBar
          percentage={percentage}
          budgeted={currentBudgetedAmount}
          spent={spent}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Minuté: {spent.toFixed(2)} €</span>
          <span>Zostáva: {remaining.toFixed(2)} €</span>
        </div>
      </div>

      {/* Tlačidlo pre zobrazenie/skrytie výdavkov */}
      {categoryExpenses.length > 0 && (
        <button
          onClick={toggleOpen}
          className="flex justify-between items-center w-full text-left text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-1 pt-2 border-t border-gray-100 focus:outline-none"
        >
          <span>{isOpen ? 'Skryť výdavky' : `Zobraziť ${categoryExpenses.length} výdavkov`}</span>
          {isOpen ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
        </button>
      )}

      <AnimatePresence>
        {isOpen && categoryExpenses.length > 0 && (
          <motion.div
            key="expense-list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mt-2 space-y-1 overflow-hidden"
          >
            {categoryExpenses.map(expense => (
              <div
                key={expense.id}
                className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-gray-200 py-0.5"
              >
                <span className="truncate pr-2" title={expense.description}>
                  {expense.description || 'Bez popisu'}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {expense.amount.toFixed(2)} €
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BudgetCard;
