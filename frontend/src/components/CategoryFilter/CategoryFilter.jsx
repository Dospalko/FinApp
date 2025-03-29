// src/components/CategoryFilter/CategoryFilter.jsx
import React from 'react';

// Hodnota pre možnosť "Všetky kategórie"
export const ALL_CATEGORIES_VALUE = "__ALL__";

const CategoryFilter = ({ categories = [], selectedCategory, onCategoryChange }) => {
  // Pridáme 'Všetky kategórie' na začiatok zoznamu pre select
  const categoryOptions = [
      { value: ALL_CATEGORIES_VALUE, label: 'Všetky kategórie' },
      ...categories.map(cat => ({ value: cat, label: cat })) // Vytvoríme objekty pre <option>
  ];

  return (
    <div className="mb-1"> {/* Zmenšený margin bottom */}
      <label htmlFor="category-filter" className="block text-sm font-medium text-slate-700 mb-1">
        Filtrovať podľa kategórie:
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        // Zmena: Rovnaký štýl ako vo formulári
        className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none pr-8 bg-no-repeat bg-right bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] transition duration-150 ease-in-out"
      >
        {categoryOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};


export default CategoryFilter;