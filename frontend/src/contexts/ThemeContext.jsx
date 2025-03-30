import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Funkcia na získanie počiatočnej témy
    const getInitialTheme = () => {
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) return storedTheme;
            // Ak nie je v localStorage, skontroluj preferencie OS
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light'; // Default pre SSR alebo ak window nie je dostupné
    };

    const [theme, setTheme] = useState(getInitialTheme);

    // Efekt na aplikovanie triedy na <html> a uloženie do localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(theme);

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // useMemo, aby sa hodnota nemenila zbytočne pri re-renderovaní
    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook pre jednoduché použitie kontextu
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};