import React, { useState, useEffect, useCallback } from 'react';
import { getBudgetStatus } from '../../api/budgetApi';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';

// Updated Progress Bar with better tooltip and over-budget handling
const ProgressBar = ({ percentage, budgeted, spent }) => {
    const cappedPercentage = Math.min(percentage, 100); // Cap visual at 100%
    const overBudget = percentage > 100;
    const percentageDisplay = Math.round(percentage);

    let bgColor = 'bg-emerald-500'; // Green < 80%
    if (percentage >= 80 && percentage <= 100) {
        bgColor = 'bg-amber-500'; // Orange 80-100%
    } else if (overBudget) {
        bgColor = 'bg-red-500'; // Red > 100%
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
            {/* Improved Tooltip */}
             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
                {tooltipText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div> {/* Arrow */}
            </div>
        </div>
    );
};


const BudgetStatus = ({ selectedYear, selectedMonth }) => {
    const [statusData, setStatusData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setStatusData([]); // Reset
        try {
            const data = await getBudgetStatus(selectedYear, selectedMonth);
            // Sort by remaining amount (most overspent first), then by percentage
            data.sort((a, b) => {
                 if (a.remaining_amount !== b.remaining_amount) {
                     return a.remaining_amount - b.remaining_amount; // Lowest remaining first (most overspent)
                 }
                 return b.percentage_spent - a.percentage_spent; // Then highest percentage spent
            });
            setStatusData(data);
        } catch (err) {
             setError(err.response?.data?.message || err.message || 'Chyba pri načítaní stavu rozpočtov.');
             console.error("Fetch Budget Status Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        // Consistent card styling
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
             {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">
                    Stav Rozpočtov
                </h2>
                 <span className="text-sm font-medium text-gray-500">
                    {selectedMonth}/{selectedYear}
                </span>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto pr-1"> {/* Allow scrolling if many items */}
                 {isLoading && (
                     <div className="flex justify-center items-center h-full py-10">
                        <Spinner size="md" color="border-purple-600"/>
                    </div>
                )}
                {error && !isLoading && (
                    <Alert type="error" message={error} />
                )}

                {!isLoading && statusData.length === 0 && !error && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Pre tento mesiac nie sú nastavené žiadne rozpočty.</p>
                    </div>
                )}

                {!isLoading && statusData.length > 0 && (
                     // List of budget items
                    <div className="space-y-4">
                        {statusData.map(item => (
                            <div key={item.id || item.category} className="text-sm border-b border-gray-100 pb-3 last:border-b-0">
                                {/* Category and Spent/Budgeted */}
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-medium text-gray-700 truncate pr-2" title={item.category}>
                                        {item.category}
                                    </span>
                                    <span className={`font-semibold text-xs sm:text-sm whitespace-nowrap ${item.remaining_amount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {item.spent_amount.toFixed(2)} / {item.budgeted_amount.toFixed(2)} €
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <ProgressBar
                                    percentage={item.percentage_spent}
                                    budgeted={item.budgeted_amount}
                                    spent={item.spent_amount}
                                />
                                {/* Remaining Amount */}
                                 <div className="text-xs text-gray-500 text-right mt-1">
                                    Zostáva: <span className={`font-medium ${item.remaining_amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{item.remaining_amount.toFixed(2)} €</span>
                                 </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetStatus;