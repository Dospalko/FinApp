import React from 'react';

const Footer = () => (
    <footer className="text-center mt-12 text-xs text-slate-400">
        Jednoduchý Expense Tracker © {new Date().getFullYear()}
    </footer>
);

export default Footer;