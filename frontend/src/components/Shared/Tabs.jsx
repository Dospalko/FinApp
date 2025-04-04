import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Upravený kontajner - odstránený flex-1 z tlačidiel nižšie */}
      <nav className="flex space-x-1 sm:space-x-2 p-1 bg-gray-100 rounded-lg max-w-md mx-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative whitespace-nowrap rounded-md px-4 py-1.5  // Upravený padding pre lepší pomer
              text-sm font-semibold // Mierne výraznejší font
              text-center transition-colors duration-200 ease-in-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100
              flex-grow // Necháme tlačidlá roztiahnuť sa, ale prispôsobia sa obsahu lepšie bez flex-1
              ${activeTab === tab.id
                ? 'text-indigo-700' // Text aktívnej záložky
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60' // Jemnejší hover
              }
            `}
            style={{ flexBasis: 0 }} // Pomôže flex-grow fungovať lepšie s rôznymi dĺžkami textu
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {/* Animovaný podklad (pill) */}
            {activeTab === tab.id && (
              <motion.span
                layoutId="activePill" // Kľúč pre animáciu medzi tlačidlami
                className="absolute inset-0 z-0 bg-white shadow-md rounded-md" // Jemnejší tieň
                transition={{ type: 'spring', stiffness: 350, damping: 35 }} // Mierne upravená animácia
              />
            )}
            {/* Text musí byť nad animovaným podkladom */}
            <span className="relative z-10">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;