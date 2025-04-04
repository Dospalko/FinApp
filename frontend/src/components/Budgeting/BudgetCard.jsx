import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../UI/Spinner';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ProgressBar = ({ percentage, budgeted, spent }) => {
     const cappedPercentage = Math.min(percentage, 100);
     const overBudget = percentage > 100;
     const percentageDisplay = Math.round(percentage);
     let bgColor = 'bg-emerald-500';
     if (percentage >= 80 && percentage <= 100) { bgColor = 'bg-amber-500'; }
     else if (overBudget) { bgColor = 'bg-red-500'; }
     const tooltipText = overBudget ? `Prekročené o ${(spent - budgeted).toFixed(2)} € (${percentageDisplay}%)` : `${percentageDisplay}% z ${budgeted.toFixed(2)} €`;
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

const listVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }
};

const BudgetCard = ({ category, budgetData, categoryExpenses = [], onBudgetChange, isSaving }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = () => setIsOpen(prev => !prev);

    const currentBudgetedAmount = budgetData?.budgeted_amount ?? 0;
    const spent = budgetData?.spent_amount ?? 0;
    // === OPRAVA: Výpočet percentuálnej hodnoty priamo tu, ak nie je v budgetData ===
    const percentage = currentBudgetedAmount > 0 ? Math.round((spent / currentBudgetedAmount) * 100) : 0;
    const remaining = (budgetData?.remaining_amount !== undefined) ? budgetData.remaining_amount : (currentBudgetedAmount - spent);
    // ==============================================================================

    const sliderMax = Math.max(100, spent * 1.2, currentBudgetedAmount * 1.5);

    const handleSliderInput = (event) => {
        onBudgetChange(category, parseFloat(event.target.value) || 0);
    };

    return (
        <motion.div
            layout="position"
            className="bg-white shadow-lg rounded-xl p-4 sm:p-5 border border-gray-100 flex flex-col h-full"
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800 truncate pr-2" title={category}>
                    {category}
                </h3>
                <div className='flex items-center space-x-2'>
                     {isSaving && <Spinner size="sm" color="border-indigo-500" />}
                    <span className={`font-bold text-right tabular-nums ${remaining < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {currentBudgetedAmount.toFixed(0)} €
                    </span>
                </div>
            </div>

            <input
                type="range"
                min="0"
                max={sliderMax}
                step="5"
                value={currentBudgetedAmount}
                onInput={handleSliderInput}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-70 mb-1"
                disabled={isSaving}
            />

            <div className="mb-3">
                {/* === OPRAVA: Odovzdanie správnych props do ProgressBar === */}
                <ProgressBar
                    percentage={percentage}
                    budgeted={currentBudgetedAmount}
                    spent={spent}
                />
                {/* ===================================================== */}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Minuté: {spent.toFixed(2)} €</span>
                    <span>Zostáva: {remaining.toFixed(2)} €</span>
                </div>
            </div>

            {categoryExpenses.length > 0 && (
                <button onClick={toggleOpen} className="flex justify-between items-center w-full text-left text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-1 pt-2 border-t border-gray-100 focus:outline-none" >
                    <span>{isOpen ? 'Skryť výdavky' : `Zobraziť ${categoryExpenses.length} výdavkov`}</span>
                    {isOpen ? <FaChevronUp className="ml-1"/> : <FaChevronDown className="ml-1"/>}
                </button>
            )}

            <AnimatePresence>
                {isOpen && categoryExpenses.length > 0 && (
                    <motion.div key="expense-list" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="mt-3 space-y-1 overflow-hidden" >
                        {categoryExpenses.map(expense => (
                            <div key={expense.id} className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-gray-200 py-0.5">
                                <span className="truncate pr-2" title={expense.description}> {expense.description || 'Bez popisu'} </span>
                                <span className="font-medium whitespace-nowrap"> {expense.amount.toFixed(2)} € </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BudgetCard;