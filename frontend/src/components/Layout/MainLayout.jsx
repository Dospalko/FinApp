import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true }); // Použi replace pre lepšiu históriu
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <Link to="/" className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                        MyFinance
                    </Link>
                    {/* TODO: Pridať navigáciu medzi sekciami (Dashboard, Budget, ...) */}
                    {isAuthenticated && user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 hidden sm:inline">
                                {user.username}
                            </span>
                            <button onClick={handleLogout} className="btn-danger text-xs">
                                Odhlásiť sa
                            </button>
                        </div>
                    ) : ( <div className="space-x-2"></div> )} {/* Placeholder pre neautentifikované */}
                </nav>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:px-8 flex-grow">
                <Outlet />
            </main>
             <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white">
                 © {new Date().getFullYear()} Finance Tracker
             </footer>
        </div>
    );
};

export default MainLayout;