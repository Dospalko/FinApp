import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PingIndicator from '../UI/PingIndicator';

const Header = ({ pingMessage, showPing }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md mb-6 sm:mb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
                        FinApp
                    </Link>

                    <div className="flex items-center space-x-4">
                        {showPing && <PingIndicator message={pingMessage} />}
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600 hidden sm:inline">Vitaj, {user.username}!</span>
                                <Link
                                    to="/profile"
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
                                >
                                    Profil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out"
                                >
                                    Odhlásiť sa
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700">Prihlásiť sa</Link>
                                <Link to="/register" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Registrovať
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;