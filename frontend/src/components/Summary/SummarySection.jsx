import React from 'react';
import SummaryCard from './SummaryCard';

const SummarySection = ({ totalIncome, totalExpenses, balance, isExpensesLoading, isIncomesLoading }) => (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Celkové Príjmy" amount={totalIncome} color="text-green-600" isLoading={isIncomesLoading} />
        <SummaryCard title="Celkové Výdavky" amount={totalExpenses} color="text-red-600" isLoading={isExpensesLoading} />
        <SummaryCard title="Zostatok" amount={balance} color={balance >= 0 ? 'text-blue-600' : 'text-red-600'} isLoading={isExpensesLoading || isIncomesLoading} isBalance={true} />
    </div>
);

export default SummarySection;