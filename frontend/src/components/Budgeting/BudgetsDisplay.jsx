import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getBudgetStatus, setBudget } from '../../api/budgetApi';
import { useExpenses } from '../../hooks/useExpenses';
import BudgetCard from './BudgetCard';
import Spinner from '../UI/Spinner';
import Alert from '../UI/Alert';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence

// Varianty pre animácie (zostávajú rovnaké)
const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};
const gridItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};


const BudgetsDisplay = ({ selectedYear, selectedMonth }) => {
    const { expenses, isLoading: isLoadingExpenses, error: expenseError } = useExpenses();
    const [budgetStatusMap, setBudgetStatusMap] = useState({});
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [budgetError, setBudgetError] = useState(null);
    const [savingStates, setSavingStates] = useState({});
    const debounceTimeoutsRef = useRef({});

    // Filtrované výdavky (zostáva rovnaké)
    const currentMonthExpenses = useMemo(() => {
        if (isLoadingExpenses) return [];
        return expenses.filter(exp => {
             try {
                 const expenseDate = new Date(exp.date_created);
                 return expenseDate.getFullYear() === selectedYear && (expenseDate.getMonth() + 1) === selectedMonth;
             } catch (e) { return false; }
        });
    }, [expenses, selectedYear, selectedMonth, isLoadingExpenses]);

    // Kategórie len z výdavkov (zostáva rovnaké)
    const availableCategories = useMemo(() => {
        if (isLoadingExpenses || expenseError) return [];
        const categories = [...new Set(currentMonthExpenses.map(exp => exp.category))];
        return categories.sort((a, b) => a.localeCompare(b));
    }, [currentMonthExpenses, isLoadingExpenses, expenseError]);

    // --- >>> OPRAVENÁ LOGIKA NAČÍTANIA <<< ---
    const fetchBudgetStatus = useCallback(async () => {
        console.log("Fetching budget status...", { selectedYear, selectedMonth }); // DEBUG log
        // Zobraz loading len pri prvom načítaní pre daný mesiac/rok
        if (Object.keys(budgetStatusMap).length === 0) {
             setIsLoadingStatus(true);
        }
        setBudgetError(null); // Resetuj chybu pred načítaním

        // Ak nie sú kategórie, nemusíme volať API
        if (availableCategories.length === 0 && !isLoadingExpenses) {
             console.log("No available categories, skipping API call."); // DEBUG log
             setBudgetStatusMap({});
             setIsLoadingStatus(false);
             return;
        }

        try {
            const statusData = await getBudgetStatus(selectedYear, selectedMonth);
            const statusMap = statusData.reduce((acc, item) => {
                // Ulož len status pre relevantné kategórie
                if (availableCategories.includes(item.category)) {
                    acc[item.category] = item;
                }
                return acc;
            }, {});
             console.log("Budget status fetched:", statusMap); // DEBUG log
            setBudgetStatusMap(statusMap);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Chyba pri načítaní stavu rozpočtov.';
            setBudgetError(errorMsg);
            console.error("Fetch Budget Status Error:", errorMsg, err);
            setBudgetStatusMap({}); // Resetuj mapu pri chybe
        } finally {
            setIsLoadingStatus(false);
        }
    // Závislosť LEN na roku, mesiaci a či sú už načítané kategórie
    }, [selectedYear, selectedMonth, availableCategories, isLoadingExpenses]); // ODSTRÁNENÁ ZÁVISLOSŤ NA budgetStatusMap!

    // Efekt na prvé načítanie a pri zmene roka/mesiaca
    useEffect(() => {
        console.log("Year or Month changed, triggering fetchBudgetStatus."); // DEBUG log
        fetchBudgetStatus();

        // Cleanup debounce timeouts on year/month change
         const timeouts = debounceTimeoutsRef.current;
         Object.values(timeouts).forEach(clearTimeout);
         debounceTimeoutsRef.current = {};
         setSavingStates({}); // Reset saving indicators
    }, [fetchBudgetStatus]); // Teraz fetchBudgetStatus mení referenciu len pri zmene Year/Month/availableCategories/isLoadingExpenses

    // --- >>> OPRAVENÝ HANDLER ZMENY SLIDERA <<< ---
    const handleBudgetChange = useCallback((category, newValue) => {
         // 1. Optimistic UI Update (lokálny stav)
         setBudgetStatusMap(prevMap => {
             const currentData = prevMap[category] || { category, spent_amount: 0, budgeted_amount: 0 };
             const spent = currentData.spent_amount;
             const newBudgeted = parseFloat(newValue) || 0;
             const newRemaining = newBudgeted - spent;
             const newPercentage = newBudgeted > 0 ? (spent / newBudgeted) * 100 : 0;
             // Logika pre update mapy zostáva rovnaká
             return { ...prevMap, [category]: { ...currentData, budgeted_amount: newBudgeted, remaining_amount: newRemaining, percentage_spent: newPercentage } };
         });

        // 2. Debounce API volanie
        if (debounceTimeoutsRef.current[category]) {
            clearTimeout(debounceTimeoutsRef.current[category]);
        }
        setSavingStates(prev => ({ ...prev, [category]: true })); // Zobraz spinner

        debounceTimeoutsRef.current[category] = setTimeout(async () => {
            try {
                console.log(`Saving budget for ${category}: ${newValue}`); // DEBUG log
                await setBudget({ // Volanie API
                    category,
                    amount: parseFloat(newValue) || 0,
                    month: selectedMonth,
                    year: selectedYear
                });
                // 3. Po úspešnom uložení UŽ NEVOLÁME fetchBudgetStatus TU
                //   pretože optimistický update už vykonal zmenu vizuálu.
                //   Ak by sme chceli absolútnu konzistenciu s DB, mohli by sme
                //   tu zavolať fetchBudgetStatus(), ale spôsobí to bliknutie.
                console.log(`Budget saved for ${category}.`); // DEBUG log

            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || `Chyba pri ukladaní ${category}.`;
                console.error(`Error saving budget for ${category}:`, err);
                setBudgetError(errorMsg); // Zobraz chybu používateľovi
                // TODO: Zvážiť vrátenie optimistickej zmeny späť pri chybe
                // Napr. znovunačítaním dát: fetchBudgetStatus();
            } finally {
                // Zastav spinner po krátkej pauze, aby bolo vidno uloženie
                setTimeout(() => {
                    setSavingStates(prev => {
                        const newState = { ...prev };
                        delete newState[category];
                        return newState;
                    });
                }, 500); // Pauza 500ms
            }
        }, 900); // Zvýšený debounce na 900ms

    // Závislosti pre useCallback - len premenné potrebné pre API volanie
    }, [selectedMonth, selectedYear]);

    // Cleanup timeouts (zostáva rovnaký)
     useEffect(() => { const timeouts = debounceTimeoutsRef.current; return () => { Object.values(timeouts).forEach(clearTimeout); }; }, []);

    const isLoading = isLoadingStatus || isLoadingExpenses;
    const displayError = budgetError || expenseError;

    return (
        <div className="h-full flex flex-col">
            {displayError && <div className="mb-4"><Alert type="error" message={displayError} onClose={() => { setBudgetError(null); /* TODO: Reset expenseError? */ }} /></div>}

            {/* --- >>> GRID S AnimatePresence <<<--- */}
            {/* AnimatePresence umožňuje animáciu pri miznutí/objavovaní položiek */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-grow overflow-y-auto pr-2 -mr-2"
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
            >
                {isLoading && (
                     <div className="col-span-1 md:col-span-2 flex justify-center items-center h-full py-10"> <Spinner size="lg" color="border-purple-600" /> </div>
                )}
                {!isLoading && availableCategories.length === 0 && !displayError && (
                     <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500"> <p>Pre tento mesiac neboli nájdené žiadne výdavky,</p> <p>pre ktoré by sa dal zobraziť alebo nastaviť rozpočet.</p> </div>
                )}
                {!isLoading && !displayError && (
                    <AnimatePresence>
                        {availableCategories.map(category => {
                            const relevantExpenses = currentMonthExpenses.filter(exp => exp.category === category);
                            return (
                                // Použijeme layout a motion.div pre každú kartu
                                <motion.div
                                    key={category} // Kľúč je dôležitý pre AnimatePresence
                                    variants={gridItemVariants}
                                    layout // Umožní plynulé presúvanie pri zmene poradia/filtrovaní
                                    initial="hidden" // Môžeme definovať aj tu
                                    animate="visible"
                                    exit="hidden" // Ako zmizne
                                >
                                    <BudgetCard
                                        category={category}
                                        budgetData={budgetStatusMap[category]}
                                        categoryExpenses={relevantExpenses}
                                        onBudgetChange={handleBudgetChange}
                                        isSaving={!!savingStates[category]}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                 )}
            </motion.div>
            {/* ================================= */}
        </div>
    );
};

export default BudgetsDisplay;