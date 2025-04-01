import React, { useState } from 'react';
import { changePassword } from '../../api/authApi';
import Alert from '../UI/Alert';
import Spinner from '../UI/Spinner';

const PasswordChangeForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmNewPassword) {
            setError("Nové heslá sa nezhodujú.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Nové heslo musí mať aspoň 6 znakov.");
            return;
        }

        setLoading(true);
        try {
            const data = await changePassword({ currentPassword, newPassword, confirmNewPassword });
            setSuccess(data.message || "Heslo úspešne zmenené.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (apiError) {
             setError(apiError.response?.data?.message || apiError.response?.data?.error || apiError.message || "Nepodarilo sa zmeniť heslo.");
        } finally {
            setLoading(false);
        }
    };

    // Define consistent input styles
    const inputClasses = `
        block w-full px-4 py-2 mt-1
        border border-gray-300 rounded-lg shadow-sm
        placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cyan-500 focus:border-cyan-500
        sm:text-sm bg-gray-50 disabled:opacity-50 transition duration-150 ease-in-out
    `;

     // Define consistent label styles
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        // Increased spacing within the form
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Consistent heading style with the info card */}
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Zmena Hesla
            </h3>

            {/* Alerts positioned neatly */}
            <div className='space-y-3'>
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}
                {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
            </div>

            {/* Input fields with updated styles */}
            <div>
                <label htmlFor="currentPassword" className={labelClasses}>
                    Aktuálne heslo
                </label>
                <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={inputClasses}
                    disabled={loading}
                    autoComplete="current-password"
                />
            </div>
             <div>
                 <label htmlFor="newPassword" className={labelClasses}>
                    Nové heslo (min. 6 znakov)
                </label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={inputClasses}
                    disabled={loading}
                    autoComplete="new-password"
                />
            </div>
             <div>
                <label htmlFor="confirmNewPassword" className={labelClasses}>
                    Potvrďte nové heslo
                </label>
                <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className={inputClasses}
                    disabled={loading}
                    autoComplete="new-password"
                />
            </div>

            {/* Button styling - primary action color, full width, spinner */}
            <div className="pt-2"> {/* Add some top padding before the button */}
                <button
                    type="submit"
                    className={`
                        w-full flex justify-center items-center
                        py-2.5 px-4 border border-transparent rounded-lg shadow-sm
                        text-sm font-medium text-white
                        bg-cyan-700 hover:bg-cyan-800
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600
                        transition duration-150 ease-in-out
                        disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" color="border-white" />
                            <span className="ml-2">Mením heslo...</span>
                        </>
                    ) : (
                        'Zmeniť heslo'
                    )}
                </button>
            </div>
        </form>
    );
};

export default PasswordChangeForm;