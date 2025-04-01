import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';

const LoginForm = () => {
  // Stavové premenné pre vstupy a chybové hlásenia
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Vymaže globálnu chybu pri zmene vstupov
  useEffect(() => {
    if (authError) setError('');
  }, [loginIdentifier, password, authError]);

  // Získanie cesty, z ktorej sme prišli (ak existuje)
  const from = location.state?.from?.pathname || "/";

  // Funkcia pre spracovanie odoslania formulára
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login({ login: loginIdentifier, password });
    setLoading(false);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(authError || "Prihlásenie zlyhalo.");
    }
  };

  return (
    // Formulár s bielym pozadím, jemným tieňom a zaoblenými rohmi
    <form onSubmit={handleSubmit} noValidate className="bg-white text-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <div>
        <label htmlFor="login" className="block mb-2 text-sm font-medium text-gray-700">
          Používateľské meno alebo E-mail
        </label>
        <input
          type="text"
          id="login"
          value={loginIdentifier}
          onChange={(e) => setLoginIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
          Heslo
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        // Tlačidlo s rovnakým gradientom z modrej do fialovej
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded flex justify-center items-center hover:opacity-90 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : 'Prihlásiť sa'}
      </button>
    </form>
  );
};

export default LoginForm;
