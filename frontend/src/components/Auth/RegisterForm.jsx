import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register, authError } = useAuth();
    const navigate = useNavigate();

    // Vymaž globálnu chybu pri zmene vstupu
    useEffect(() => { if (authError) setError(''); }, [username, email, password, confirmPassword, authError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError("Heslá sa nezhodujú."); return; }
        if (password.length < 6) { setError("Heslo musí mať aspoň 6 znakov."); return; }

        setLoading(true);
        const success = await register({ username, email, password });
        setLoading(false);
        if (success) {
            navigate("/"); // Presmeruj na dashboard
        } else {
            setError(authError || "Registrácia zlyhala.");
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
             {error && <Alert type="error" message={error} onClose={() => setError('')}/>}
            <div>
                <label htmlFor="username" className="label">Používateľské meno</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="input" disabled={loading}/>
            </div>
            <div>
                <label htmlFor="email" className="label">E-mail</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" disabled={loading}/>
            </div>
            <div>
                <label htmlFor="password" className="label">Heslo (min. 6 znakov)</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input" disabled={loading}/>
            </div>
            <div>
                <label htmlFor="confirmPassword" className="label">Potvrďte heslo</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input" disabled={loading}/>
            </div>
            <button type="submit" className="w-full btn-primary flex justify-center" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Zaregistrovať sa'}
            </button>
        </form>
    );
};
export default RegisterForm;