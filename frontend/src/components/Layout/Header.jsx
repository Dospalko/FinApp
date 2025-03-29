import React from 'react';

const Header = ({ pingMessage, showPing }) => (
    <header className="mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-center text-slate-900">
            Finance Tracker
        </h1>
        {showPing && (
            <p className={`text-center text-xs mt-2 p-1.5 rounded ${pingMessage.startsWith('Backend nedostupný') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {pingMessage}
            </p>
        )}
    </header>
);

export default Header;