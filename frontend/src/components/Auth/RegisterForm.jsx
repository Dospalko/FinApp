import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';

const RegisterForm = () => {
  // Stavové premenné pre vstupy a chybové hlásenia
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, authError } = useAuth();
  const navigate = useNavigate();

  // Vymaže globálnu chybu pri zmene vstupov
  useEffect(() => {
    if (authError) setError('');
  }, [username, email, password, confirmPassword, authError]);

  // Funkcia pre spracovanie odoslania formulára
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Heslá sa nezhodujú.");
      return;
    }
    if (password.length < 6) {
      setError("Heslo musí mať aspoň 6 znakov.");
      return;
    }

    setLoading(true);
    const success = await register({ username, email, password });
    setLoading(false);
    if (success) {
      navigate("/"); // Presmerovanie na dashboard
    } else {
      setError(authError || "Registrácia zlyhala.");
    }
  };

  return (
    // Formulár s bielym pozadím, jemným tieňom a zaoblenými rohmi
    <form onSubmit={handleSubmit} noValidate className="bg-white text-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <div>
        <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
          Používateľské meno
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          // Vstup so štýlom vhodným pre bielu tému: biele pozadie, svetlé okraje a modrý focus efekt
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
          E-mail
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
          Heslo (min. 6 znakov)
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
          Potvrďte heslo
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        // Tlačidlo s gradientom z modrej do fialovej pre výrazný akcent
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded flex justify-center items-center hover:opacity-90 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : 'Zaregistrovať sa'}
      </button>
    </form>
  );
};

export default RegisterForm;
