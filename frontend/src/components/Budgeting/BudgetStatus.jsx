// src/components/Budgeting/BudgetStatus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getBudgetStatus } from '../../api/budgetApi';

// Komponent pre Progress Bar
const ProgressBar = ({ percentage, budgeted }) => {
    const cappedPercentage = Math.min(Math.max(percentage, 0), 100); // Obmedzenie 0-100%
    const overBudget = percentage > 100;
    const percentageDisplay = Math.round(percentage); // Zaokrúhlené percento na zobrazenie

    // Farby podľa percenta čerpania
    let bgColor = 'bg-emerald-500'; // Zelená < 80%
    if (cappedPercentage >= 80 && cappedPercentage <= 100) {
        bgColor = 'bg-amber-500'; // Oranžová 80-100%
    } else if (overBudget) {
        bgColor = 'bg-red-500'; // Červená > 100%
    }

    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden my-1 relative group">
            <div
                className={`h-2.5 rounded-full ${bgColor} transition-all duration-500 ease-out`}
                style={{ width: `${overBudget ? 100 : cappedPercentage}%` }} // Pri prekročení vyplní 100%
            ></div>
            {/* Tooltip s presným percentom */}
             <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-700 text-white text-xs rounded shadow-lg whitespace-nowrap">
                {percentageDisplay}% z {budgeted.toFixed(2)} €
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
        try {
            const data = await getBudgetStatus(selectedYear, selectedMonth);
            // Zoradíme napr. podľa percenta čerpania alebo abecedne
            data.sort((a, b) => b.percentage_spent - a.percentage_spent);
            setStatusData(data);
        } catch (err) {
            setError('Chyba pri načítaní stavu rozpočtov.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    return (
        <div className="p-5 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-semibold mb-5 text-slate-800">Stav Rozpočtov ({selectedMonth}/{selectedYear})</h2>

            {isLoading && <p className="text-slate-500 text-center">Načítavam stav...</p>}
            {error && <p className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200">{error}</p>}

            {!isLoading && statusData.length === 0 && !error && (
                <p className="text-slate-500 text-center py-4">Pre tento mesiac nie sú nastavené žiadne rozpočty.</p>
            )}

            {!isLoading && statusData.length > 0 && (
                <div className="space-y-4">
                    {statusData.map(item => (
                        <div key={item.id || item.category} className="text-sm">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-medium text-slate-700">{item.category}</span>
                                <span className={`font-semibold ${item.remaining_amount < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                                    {item.spent_amount.toFixed(2)} / {item.budgeted_amount.toFixed(2)} €
                                </span>
                            </div>
                            <ProgressBar percentage={item.percentage_spent} budgeted={item.budgeted_amount} />
                             <div className="text-xs text-slate-500 text-right mt-0.5">
                                Zostáva: {item.remaining_amount.toFixed(2)} €
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BudgetStatus;