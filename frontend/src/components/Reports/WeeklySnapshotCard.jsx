import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeeklySnapshot, setWeeklyFocus } from '../../api/reportApi';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';
import { FaArrowUp, FaArrowDown, FaBullseye, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(amount || 0);
};

const WeeklySnapshotCard = () => {
    const [snapshotData, setSnapshotData] = useState(null);
    const [focusText, setFocusText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isVisible, setIsVisible] = useState(true);

    const fetchSnapshot = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await getWeeklySnapshot(); // Zavolá API (ktoré teraz vráti dummy dáta)
            setSnapshotData(data);
            // Ak máme fokus z API, predvyplníme ho (alebo necháme prázdne)
            setFocusText(data?.current_focus || '');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Nepodarilo sa načítať týždenný prehľad.');
            console.error("Fetch Snapshot Error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSnapshot();
    }, [fetchSnapshot]);

    const handleFocusChange = (event) => {
        setFocusText(event.target.value);
    };

    const handleSubmitFocus = async (event) => {
        event.preventDefault();
        if (!focusText.trim()) {
            // Môžeme povoliť aj vymazanie fokusu prázdnym stringom? Ak áno, túto validáciu zmeň.
            // Ak vyžadujeme text:
            setError("Zadajte text pre týždenný fokus.");
            return;
        }
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            // Zavolá API (ktoré teraz vráti dummy úspech)
            const savedData = await setWeeklyFocus({ focusText: focusText.trim() });
            setSuccessMessage(savedData.message || 'Fokus bol uložený!');
            setTimeout(() => {
                // setIsVisible(false); // Možnosť skryť kartu
                setSuccessMessage(null); // Schovaj len success message po čase
                // Aktualizuj zobrazený fokus text, ak by sa líšil od uloženého
                // setFocusText(savedData.focus_text || '');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Nepodarilo sa uložiť týždenný fokus.');
            console.error("Save Focus Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-gradient-to-br from-white via-gray-50 to-gray-100 p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 mb-6 sm:mb-8"
                >
                    {isLoading && (
                        <div className="flex justify-center items-center min-h-[150px]">
                            <Spinner color="border-indigo-500" />
                        </div>
                    )}

                    {error && !isLoading && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}

                    {!isLoading && !error && snapshotData && (
                        <>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Prehľad: {new Date(snapshotData.start_date_last_week).toLocaleDateString('sk-SK')} - {new Date(snapshotData.end_date_last_week).toLocaleDateString('sk-SK')}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FaArrowUp className="text-green-500 text-xl flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-green-700 font-medium">Príjem</div>
                                        <div className="text-lg font-bold text-green-800">{formatCurrency(snapshotData.total_income_last_week)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <FaArrowDown className="text-red-500 text-xl flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-red-700 font-medium">Výdavky</div>
                                        <div className="text-lg font-bold text-red-800">{formatCurrency(snapshotData.total_expenses_last_week)}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-3 p-3 rounded-lg ${snapshotData.net_flow_last_week >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                     <FaInfoCircle className={`text-xl flex-shrink-0 ${snapshotData.net_flow_last_week >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                                    <div>
                                        <div className={`text-xs font-medium ${snapshotData.net_flow_last_week >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Čistý Tok</div>
                                        <div className={`text-lg font-bold ${snapshotData.net_flow_last_week >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatCurrency(snapshotData.net_flow_last_week)}</div>
                                    </div>
                                </div>
                            </div>

                            {snapshotData.top_spending_categories && snapshotData.top_spending_categories.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Kategórie Výdavkov:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {snapshotData.top_spending_categories.map((cat, index) => (
                                            <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                {cat.category}: {formatCurrency(cat.amount)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {snapshotData.biggest_expense && (
                                <div className="text-sm text-gray-600 mb-5">
                                    <span className='font-medium'>Najväčší výdavok:</span> {snapshotData.biggest_expense.description} ({formatCurrency(snapshotData.biggest_expense.amount)})
                                </div>
                             )}

                            <hr className="my-5 border-gray-200" />

                            <h2 className="text-lg font-semibold text-gray-700 mb-3">Tento týždeň</h2>

                            {successMessage && !isSaving && ( // Zobraz success len ak sa neukladá
                                <div className="mb-4">
                                    <Alert type="success" message={successMessage} onClose={()=> setSuccessMessage(null)} />
                                </div>
                            )}

                            <form onSubmit={handleSubmitFocus} className="space-y-3">
                                <div>
                                    <label htmlFor="weeklyFocus" className="block text-sm font-medium text-gray-600 mb-1">
                                        Tvoj aktuálny fokus:
                                    </label>
                                    <input
                                        type="text"
                                        id="weeklyFocus"
                                        value={focusText}
                                        onChange={handleFocusChange}
                                        placeholder="Zadaj svoj cieľ alebo na čo sa zameriaš..."
                                        className="w-full input"
                                        disabled={isSaving}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto btn-primary px-5 py-2 flex items-center justify-center"
                                    disabled={isSaving || !focusText.trim() || successMessage} // Blokuj aj pri zobrazenom úspechu? Zvážiť.
                                >
                                    {isSaving ? ( <Spinner size="sm" color="border-white" /> )
                                             : ( successMessage ? <FaCheckCircle className="mr-2" /> : <FaBullseye className="mr-2" />)
                                    }
                                    {isSaving ? 'Ukladám...' : (successMessage ? 'Uložené' : 'Uložiť Fokus')}
                                </button>
                            </form>
                        </>
                    )}

                     {!isLoading && !error && !snapshotData && (
                         <div className="text-center py-10 text-gray-500">
                            <p>Dáta za minulý týždeň sa nepodarilo načítať alebo ešte nie sú dostupné.</p>
                        </div>
                     )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WeeklySnapshotCard;