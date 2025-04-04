import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion

// Context & Auth
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Hooks needed by Layout
import { usePing } from './hooks/usePing';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Page Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// AppLayout s novým pozadím a animáciou pre deti
const AppLayout = ({ children }) => {
    const { pingMessage, showPing } = usePing();

    const mainVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
        // Svetlejšie pozadie pre čistejší vzhľad
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
            <Header pingMessage={pingMessage} showPing={showPing} />
            {/* Animovaný hlavný obsah */}
            <motion.main
                key={window.location.pathname} // Re-animate on route change
                variants={mainVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 flex-grow"
            >
                {children} {/* Render the page content here */}
            </motion.main>
            <Footer />
        </div>
    );
};

// Main App component remains largely the same
function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <DashboardPage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
             <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <ProfilePage />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            {/* Catch All */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;