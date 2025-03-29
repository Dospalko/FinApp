import React from 'react';

const SummaryCard = ({ title, amount, color, isLoading, isBalance = false }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 text-center">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</h3>
        {isLoading ? (
            <div className="h-7 bg-slate-200 rounded animate-pulse w-3/4 mx-auto"></div>
        ) : (
            <p className={`text-2xl font-semibold ${color}`}>
                {isBalance && amount !== 0 && (amount > 0 ? '+' : '-')}
                {Math.abs(amount).toFixed(2)} €
            </p>
        )}
    </div>
);

export default SummaryCard;