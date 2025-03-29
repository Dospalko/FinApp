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
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-600 mb-1">
        Filtrovať podľa kategórie:
      </label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
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