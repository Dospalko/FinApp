// src/components/Shared/DateSelector.jsx
import React, { useMemo } from 'react';

const DateSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
    const currentYear = new Date().getFullYear();

    // Generovanie rokov pre select
    const yearOptions = useMemo(() => {
        const years = [];
        // Rozsah rokov napr. 5 rokov dozadu a 1 dopredu
        for (let y = currentYear + 1; y >= currentYear - 5; y--) {
            years.push(y);
        }
        return years;
    }, [currentYear]);

     // Generovanie mesiacov
     const monthOptions = useMemo(() => {
         return [...Array(12).keys()].map(i => ({
             value: i + 1,
             label: new Date(0, i).toLocaleString('sk-SK', { month: 'long' })
         }));
     }, []);


    return (
        <div className="mb-6 p-4 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2">
            <label htmlFor="month-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Zobraziť dáta pre:
            </label>
            <div className="flex gap-2">
                <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={onMonthChange} // Použijeme handler z props
                    className="px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                >
                    {monthOptions.map(month => (
                        <option key={month.value} value={month.value}>
                            {month.label}
                        </option>
                    ))}
                </select>
                 <select
                    id="year-select"
                    value={selectedYear}
                    onChange={onYearChange} // Použijeme handler z props
                    className="px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150"
                >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
            </div>
        </div>
    );
};

export default DateSelector;