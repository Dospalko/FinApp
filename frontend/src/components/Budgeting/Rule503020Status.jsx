// src/components/Budgeting/Rule503020Status.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getRuleStatus } from '../../api/budgetApi';

// Komponent pre jednu kategóriu pravidla
const RuleCategoryStatus = ({ name, targetPercent, actualPercent, actualAmount, colorClass }) => (
    <div className={`p-4 rounded-lg ${colorClass} bg-opacity-10 border ${colorClass.replace('text','border')}`}>
        <h4 className="font-semibold text-sm text-slate-800">{name}</h4>
        <p className={`text-2xl font-bold ${colorClass}`}>{actualPercent.toFixed(1)}%</p>
        <p className="text-xs text-slate-500 mt-1">
            Cieľ: {targetPercent}% | Minuté: {actualAmount.toFixed(2)} €
        </p>
         {/* Jednoduchý progress bar porovnávajúci skutočnosť s cieľom */}
         <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
                className={`${colorClass.replace('text','bg')} h-1.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${Math.min((actualPercent / targetPercent) * 100, 100)}%` }} // Percento z cieľa
            ></div>
        </div>
    </div>
);


const Rule503020Status = ({ selectedYear, selectedMonth }) => {
    const [ruleStatus, setRuleStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRuleStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getRuleStatus(selectedYear, selectedMonth);
            setRuleStatus(data);
        } catch (err) {
            setError('Chyba pri načítaní stavu pravidla 50/30/20.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchRuleStatus();
    }, [fetchRuleStatus]);

    return (
        <div className="p-5 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-lg font-semibold mb-5 text-slate-800">Pravidlo 50/30/20 ({selectedMonth}/{selectedYear})</h2>

            {isLoading && <p className="text-slate-500 text-center">Načítavam stav...</p>}
            {error && <p className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200">{error}</p>}

            {!isLoading && !ruleStatus && !error && (
                 <p className="text-slate-500 text-center py-4">Pre tento mesiac nie sú dostupné dáta.</p>
            )}

            {!isLoading && ruleStatus && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Celkový príjem v období: <strong>{ruleStatus.total_income.toFixed(2)} €</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <RuleCategoryStatus
                            name="Potreby (Needs)"
                            targetPercent={50}
                            actualPercent={ruleStatus.needs?.spent_percent || 0}
                            actualAmount={ruleStatus.needs?.spent_amount || 0}
                            colorClass="text-blue-600" // Modrá pre potreby
                        />
                        <RuleCategoryStatus
                            name="Priania (Wants)"
                            targetPercent={30}
                            actualPercent={ruleStatus.wants?.spent_percent || 0}
                            actualAmount={ruleStatus.wants?.spent_amount || 0}
                            colorClass="text-purple-600" // Fialová pre priania
                        />
                        {/* Zobrazujeme výdavky označené ako Savings */}
                        <RuleCategoryStatus
                            name="Úspory/Invest. (Výdavky)"
                            targetPercent={20} // Cieľ pre celkové sporenie
                            actualPercent={ruleStatus.savings_expenses?.spent_percent || 0}
                            actualAmount={ruleStatus.savings_expenses?.spent_amount || 0}
                            colorClass="text-amber-600" // Oranžová pre investície/sporenie ako výdavok
                        />
                    </div>
                     {ruleStatus.unclassified_amount > 0 && (
                         <p className="text-xs text-slate-500 pt-2">
                             Nezaradené výdavky: {ruleStatus.unclassified_amount.toFixed(2)} €
                             (tieto nie sú zahrnuté v percentách vyššie).
                         </p>
                     )}
                     {/* TODO: Možno pridať výpočet skutočného % usporenia */}
                </div>
            )}
        </div>
    );
};

export default Rule503020Status;