import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';

const LoginForm = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, authError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Vymaž globálnu chybu pri zmene vstupu
    useEffect(() => { if (authError) setError(''); }, [loginIdentifier, password, authError]);

    const from = location.state?.from?.pathname || "/";

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
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
             {error && <Alert type="error" message={error} onClose={() => setError('')}/>}
            <div>
                <label htmlFor="login" className="label">Používateľské meno alebo E-mail</label>
                <input type="text" id="login" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} className="input" required autoComplete="username" disabled={loading}/>
            </div>
            <div>
                <label htmlFor="password" className="label">Heslo</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required autoComplete="current-password" disabled={loading}/>
            </div>
            <button type="submit" className="w-full btn-primary flex justify-center" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Prihlásiť sa'}
            </button>
        </form>
    );
};
export default LoginForm;