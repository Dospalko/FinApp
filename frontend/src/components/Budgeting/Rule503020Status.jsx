import React, { useState, useEffect, useCallback } from 'react';
import { getRuleStatus } from '../../api/budgetApi';
import Spinner from '../UI/Spinner'; // Assuming Spinner component exists
import Alert from '../UI/Alert'; // Assuming Alert component exists

// Updated category component with better styling
const RuleCategoryStatus = ({ name, targetPercent, actualPercent, actualAmount, colorBase }) => {
    // Generate Tailwind classes based on the colorBase (e.g., 'sky', 'purple', 'emerald')
    const textColor = `text-${colorBase}-600`;
    const bgColor = `bg-${colorBase}-500`; // For progress bar
    const lightBgColor = `bg-${colorBase}-100`;
    const borderColor = `border-${colorBase}-200`;

    const progressWidth = Math.min((actualPercent / targetPercent) * 100, 100); // Cap at 100% for visual

    return (
        <div className={`p-4 rounded-lg ${lightBgColor} border ${borderColor}`}>
            <h4 className="font-semibold text-base text-gray-700 mb-1">{name}</h4>
            <p className={`text-3xl font-bold ${textColor} mb-1`}>
                {actualPercent.toFixed(1)}%
                <span className="text-sm font-normal text-gray-500 ml-1"> / {targetPercent}% cieľ</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">
                Minuté: {actualAmount.toFixed(2)} €
            </p>
             {/* Improved progress bar */}
             <div className="w-full bg-gray-200 rounded-full h-2" title={`Cieľ: ${targetPercent}%, Dosiahnuté: ${actualPercent.toFixed(1)}%`}>
                <div
                    className={`${bgColor} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${progressWidth}%` }}
                ></div>
            </div>
        </div>
    );
};


const Rule503020Status = ({ selectedYear, selectedMonth }) => {
    const [ruleStatus, setRuleStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRuleStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRuleStatus(null); // Reset status on fetch
        try {
            const data = await getRuleStatus(selectedYear, selectedMonth);
            // Handle cases where data might be empty or incomplete
            if (data && typeof data.total_income !== 'undefined') {
                 setRuleStatus(data);
            } else {
                // Set to an empty-like state if backend returns null or incomplete data for the period
                setRuleStatus(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Chyba pri načítaní stavu pravidla 50/30/20.');
            console.error("Fetch Rule Status Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchRuleStatus();
    }, [fetchRuleStatus]);

    return (
        // Consistent card styling
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">
                    Pravidlo 50/30/20
                </h2>
                <span className="text-sm font-medium text-gray-500">
                    {selectedMonth}/{selectedYear}
                </span>
            </div>

             {/* Content Area */}
             <div className="flex-grow">
                {isLoading && (
                    <div className="flex justify-center items-center h-full py-10">
                        <Spinner size="md" color="border-purple-600"/>
                    </div>
                )}
                {error && !isLoading && (
                    <Alert type="error" message={error} />
                )}

                {!isLoading && !error && ruleStatus && typeof ruleStatus.total_income !== 'undefined' && (
                    <div className="space-y-5">
                        <div className="text-center border-b pb-3 mb-4">
                            <span className="text-sm text-gray-500 block">Celkový príjem v období</span>
                            <span className="text-2xl font-bold text-gray-800 block">
                                {ruleStatus.total_income.toFixed(2)} €
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                            <RuleCategoryStatus
                                name="Potreby"
                                targetPercent={50}
                                actualPercent={ruleStatus.needs?.spent_percent || 0}
                                actualAmount={ruleStatus.needs?.spent_amount || 0}
                                colorBase="sky" // Blue for Needs
                            />
                            <RuleCategoryStatus
                                name="Priania"
                                targetPercent={30}
                                actualPercent={ruleStatus.wants?.spent_percent || 0}
                                actualAmount={ruleStatus.wants?.spent_amount || 0}
                                colorBase="purple" // Purple for Wants
                            />
                            {/* Combined Savings/Investments (tracked as expenses) */}
                             <RuleCategoryStatus
                                name="Úspory"
                                targetPercent={20} // Target for total savings goal
                                actualPercent={ruleStatus.savings_expenses?.spent_percent || 0}
                                actualAmount={ruleStatus.savings_expenses?.spent_amount || 0}
                                colorBase="emerald" // Green for Savings
                            />
                        </div>
                         {ruleStatus.unclassified_amount > 0 && (
                            <p className="text-xs text-center text-gray-500 pt-2">
                                Nezaradené výdavky: {ruleStatus.unclassified_amount.toFixed(2)} € (nezahrnuté vyššie)
                            </p>
                         )}
                         {/* Consider adding actual savings calculation if API provides it */}
                         {/* Example: Total Income - Needs Spent - Wants Spent */}
                         {/* <p>Real Savings Rate: X %</p> */}
                    </div>
                )}

                {/* No Data State (distinct from error) */}
                {!isLoading && !error && (!ruleStatus || typeof ruleStatus.total_income === 'undefined') && (
                     <div className="text-center py-10 text-gray-500">
                         <p>Pre tento mesiac nie sú dostupné dáta.</p>
                         <p className="text-xs mt-1">(Žiadny príjem alebo výdavky)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rule503020Status;