import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeeklySnapshot, setWeeklyFocus } from '../../api/reportApi';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';
import { FaArrowUp, FaArrowDown, FaBullseye, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(numericAmount);
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
            const data = await getWeeklySnapshot();
            if (data.error) {
                 setError(data.error);
                 setSnapshotData(null);
            } else {
                setSnapshotData(data);
                setFocusText(data?.current_focus || '');
            }
        } catch (err) {
             // Chybu už spracovávame v reportApi, tu len zobrazíme message
            setError(err.message || 'Nepodarilo sa načítať týždenný prehľad.');
            console.error("Fetch Snapshot Error (Component):", err);
            setSnapshotData(null);
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
        const textToSave = focusText.trim();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const savedData = await setWeeklyFocus({ focusText: textToSave });
            setSuccessMessage(textToSave === '' ? (savedData?.message || 'Fokus bol vymazaný!') : (savedData?.message || 'Fokus bol uložený!'));
            if (textToSave === '') {
                setFocusText('');
            } else if (savedData?.focus_text) {
                setFocusText(savedData.focus_text);
            }
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setError(err.message || 'Nepodarilo sa uložiť týždenný fokus.');
            console.error("Save Focus Error (Component):", err);
        } finally {
            setIsSaving(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: -20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const formatDate = (isoDateString) => {
         if (!isoDateString || typeof isoDateString !== 'string') return '?';
         try {
             const date = new Date(isoDateString + 'T00:00:00Z');
             if (isNaN(date.getTime())) { throw new Error("Invalid date"); }
             return date.toLocaleDateString('sk-SK', { timeZone: 'UTC' });
         } catch (e) { console.error("Date formatting error:", isoDateString, e); return '?'; }
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
                    {isLoading && ( <div className="flex justify-center items-center min-h-[200px]"> <Spinner color="border-indigo-500" size="lg"/> </div> )}
                    {error && !isLoading && ( <div className="min-h-[200px] flex flex-col justify-center"> <Alert type="error" message={error} onClose={() => setError(null)} /> </div> )}
                    {!isLoading && !error && snapshotData && (
                        <>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Prehľad za posledných 7 dní ({formatDate(snapshotData.start_date_range)} - {formatDate(snapshotData.end_date_range)})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                                    <FaArrowUp className="text-green-500 text-xl flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-green-700 font-medium">Príjem</div>
                                        <div className="text-lg font-bold text-green-800">{formatCurrency(snapshotData.total_income_last_period)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                                    <FaArrowDown className="text-red-500 text-xl flex-shrink-0" />
                                    <div>
                                        <div className="text-xs text-red-700 font-medium">Výdavky</div>
                                        <div className="text-lg font-bold text-red-800">{formatCurrency(snapshotData.total_expenses_last_period)}</div>
                                    </div>
                                </div>
                                <div className={`flex items-center space-x-3 p-3 rounded-lg shadow-sm ${snapshotData.net_flow_last_period >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                     <FaInfoCircle className={`text-xl flex-shrink-0 ${snapshotData.net_flow_last_period >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                                    <div>
                                        <div className={`text-xs font-medium ${snapshotData.net_flow_last_period >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Čistý Tok</div>
                                        <div className={`text-lg font-bold ${snapshotData.net_flow_last_period >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatCurrency(snapshotData.net_flow_last_period)}</div>
                                    </div>
                                </div>
                            </div>
                            {snapshotData.top_spending_categories && snapshotData.top_spending_categories.length > 0 && (
                                <div className="mb-5">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Top Kategórie Výdavkov:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {snapshotData.top_spending_categories.map((cat, index) => (
                                            <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
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
                            {successMessage && !isSaving && (
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
                                        type="text" id="weeklyFocus" value={focusText} onChange={handleFocusChange}
                                        placeholder="Zadaj svoj cieľ alebo na čo sa zameriaš..."
                                        className="w-full input" disabled={isSaving}
                                    />
                                </div>
                                <button type="submit" className="w-full sm:w-auto btn-primary px-5 py-2 flex items-center justify-center"
                                    disabled={isSaving || !!successMessage} >
                                    {isSaving ? ( <Spinner size="sm" color="border-white" /> ) : ( successMessage ? <FaCheckCircle className="mr-2" /> : <FaBullseye className="mr-2" />)}
                                    {isSaving ? 'Ukladám...' : (successMessage ? 'Uložené' : 'Uložiť Fokus')}
                                </button>
                            </form>
                        </>
                    )}
                     {!isLoading && !error && !snapshotData && (
                         <div className="text-center py-10 text-gray-500">
                            <p>Dáta pre týždenný prehľad nie sú k dispozícii.</p>
                        </div>
                     )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WeeklySnapshotCard;