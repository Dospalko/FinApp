// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Cesta k hlavnému CSS
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Obalenie celej aplikácie */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);