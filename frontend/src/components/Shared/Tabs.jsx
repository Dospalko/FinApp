// src/components/Shared/Tabs.jsx
import React from 'react';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6 border-b border-slate-300">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600' // Aktívna záložka
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-400' // Neaktívna záložka
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;