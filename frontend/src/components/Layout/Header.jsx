import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importuj hook

// Predpokladáme, že tento komponent dostáva pingMessage a showPing ako props
const Header = ({ pingMessage, showPing }) => {
    const { user, logout, isAuthenticated } = useAuth(); // Získaj stav a funkciu logout
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true }); // Presmeruj po odhlásení
    };

    return (
        <header className="mb-6 pb-4">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Finance Tracker
                </h1>
                {/* Zobrazí info o userovi a logout tlačidlo ak je prihlásený */}
                {isAuthenticated && user ? (
                    <div className="flex items-center space-x-3">
                         <span className="text-sm text-gray-600 hidden sm:inline">
                             {user.username}
                         </span>
                         <button
                            onClick={handleLogout}
                            className="btn-danger-outline text-xs px-2 py-1"
                         >
                            Odhlásiť sa
                         </button>
                     </div>
                ) : (
                    // Ak nie je prihlásený, môžeš zobraziť linky na login/register
                    // Alebo nič, ak sú to samostatné stránky
                    <div></div>
                )}
            </div>
            {showPing && (
                <p className={`text-center text-xs p-1 rounded ${pingMessage?.includes('nedostupný') || pingMessage?.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {pingMessage || 'Načítavam stav API...'}
                </p>
            )}
        </header>
    );
};

export default Header;