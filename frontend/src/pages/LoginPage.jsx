import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm'; // Formulár
import { useAuth } from '../contexts/AuthContext'; // Na kontrolu stavu

const LoginPage = () => {
    const { isAuthenticated } = useAuth();

    // Ak je už používateľ prihlásený, presmeruj ho na hlavnú stránku
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-sm bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Prihlásenie</h2>
                <LoginForm />
                <p className="mt-6 text-center text-sm text-gray-600">
                    Ešte nemáte účet? <Link to="/register" className="link">Zaregistrujte sa</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;