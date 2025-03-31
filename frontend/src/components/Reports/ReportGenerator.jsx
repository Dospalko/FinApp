import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { getBudgetStatus, getRuleStatus } from '../../api/budgetApi';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
    return `${sign}${Math.abs(amount).toFixed(2)} €`;
};

const ReportGenerator = ({
    selectedMonth,
    selectedYear,
    incomes,
    expenses,
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generateMonthlyReport = async () => {
        setIsGenerating(true);
        setError(null);
        console.log(`Generating PDF report for ${selectedMonth}/${selectedYear}...`);

        const filteredExpenses =  expenses.filter(exp => {
             try {
                 const date = new Date(exp.date_created);
                 return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
             } catch (e) { return false; }
         });

        const filteredIncomes = incomes.filter(inc => {
             try {
                 const date = new Date(inc.date_created);
                 return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
             } catch (e) { return false; }
         });

        const currentTotalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount, 0);
        const currentTotalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const currentBalance = currentTotalIncome - currentTotalExpenses;

        try {
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            // Font pre diakritiku (treba mať súbor a správnu cestu):
            // doc.addFont('path/to/DejaVuSans.ttf', 'DejaVuSans', 'normal');
            // doc.setFont('DejaVuSans');

            let yPos = 20;
            const pageHeight = doc.internal.pageSize.height;
            const bottomMargin = 20;
            const lineSpacing = 7;
            const tableSpacing = 10;
            const leftMargin = 15;
            const rightMargin = doc.internal.pageSize.width - 15; // Pre text vpravo

            const checkPageBreak = (neededHeight) => {
                if (yPos + neededHeight > pageHeight - bottomMargin) {
                    doc.addPage();
                    yPos = 20;
                    return true;
                }
                return false;
            };

            // --- Hlavička ---
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Mesačný finančný prehľad', leftMargin, yPos);
            yPos += lineSpacing * 1.5;
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('sk-SK', { month: 'long' });
            doc.text(`Obdobie: ${monthName} ${selectedYear}`, leftMargin, yPos);
            yPos += lineSpacing * 2;

            // --- Súhrn ---
            checkPageBreak(lineSpacing * 4 + 5); // +5 pre nadpis
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Finančný súhrn:', leftMargin, yPos);
            yPos += lineSpacing;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`Celkové príjmy:`, leftMargin, yPos);
            doc.text(formatCurrency(currentTotalIncome), rightMargin, yPos, { align: 'right' });
            yPos += lineSpacing;
            doc.text(`Celkové výdavky:`, leftMargin, yPos);
            doc.text(formatCurrency(currentTotalExpenses * -1), rightMargin, yPos, { align: 'right' });
            yPos += lineSpacing;
            doc.setFont(undefined, 'bold');
            doc.text(`Zostatok na konci obdobia:`, leftMargin, yPos);
            doc.text(formatCurrency(currentBalance), rightMargin, yPos, { align: 'right' });
            doc.setFont(undefined, 'normal'); // Reset bold
            yPos += tableSpacing;

            // --- Tabuľka Výdavkov ---
            checkPageBreak(20);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text('Zoznam výdavkov:', leftMargin, yPos);
            yPos += lineSpacing;

            if (filteredExpenses.length > 0) {
                const expenseTableHead = [['Dátum', 'Popis', 'Kategória', 'Suma (€)']];
                const expenseTableBody = filteredExpenses
                    .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
                    .map(exp => [
                        formatDateForDisplay(exp.date_created),
                        exp.description,
                        exp.category || '-', // Zobraz pomlčku ak chýba kategória
                        (exp.amount * -1).toFixed(2) // Len číslo bez meny, mena je v hlavičke
                    ]);

                autoTable(doc, {
                    head: expenseTableHead,
                    body: expenseTableBody,
                    startY: yPos,
                    theme: 'striped', // 'striped' vyzerá čistejšie
                    headStyles: { fillColor: [67, 56, 202] }, // Tmavo fialová (indigo-700)
                    styles: { fontSize: 8.5, cellPadding: 2.5, overflow: 'linebreak' },
                    columnStyles: {
                         0: { cellWidth: 18 }, // Dátum
                         1: { cellWidth: 'auto' }, // Popis - automatická šírka
                         2: { cellWidth: 30 }, // Kategória
                         3: { halign: 'right', cellWidth: 20 } // Suma
                        },
                    didDrawPage: (data) => { // Aktualizácia yPos po každej stránke tabuľky
                       yPos = data.cursor.y;
                     }
                });
                yPos = doc.lastAutoTable.finalY + tableSpacing; // Aktualizácia yPos po celej tabuľke
            } else {
                 doc.setFontSize(9);
                 doc.setFont(undefined, 'italic');
                 doc.text('Žiadne výdavky v tomto období.', leftMargin, yPos);
                 yPos += lineSpacing;
            }

             // --- Tabuľka Príjmov ---
             checkPageBreak(20);
             doc.setFontSize(11);
             doc.setFont(undefined, 'bold');
             doc.text('Zoznam príjmov:', leftMargin, yPos);
             yPos += lineSpacing;

            if (filteredIncomes.length > 0) {
                const incomeTableHead = [['Dátum', 'Popis', 'Zdroj', 'Suma (€)']];
                const incomeTableBody = filteredIncomes
                    .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
                    .map(inc => [
                        formatDateForDisplay(inc.date_created),
                        inc.description,
                        inc.source || '-', // Pomlčka ak chýba zdroj
                        inc.amount.toFixed(2) // Len číslo bez meny
                    ]);

                autoTable(doc, {
                    head: incomeTableHead,
                    body: incomeTableBody,
                    startY: yPos,
                    theme: 'striped',
                    headStyles: { fillColor: [4, 120, 87] }, // Tmavozelená (emerald-700)
                    styles: { fontSize: 8.5, cellPadding: 2.5, overflow: 'linebreak' },
                    columnStyles: {
                         0: { cellWidth: 18 },
                         1: { cellWidth: 'auto' },
                         2: { cellWidth: 30 },
                         3: { halign: 'right', cellWidth: 20 }
                        },
                    didDrawPage: (data) => { yPos = data.cursor.y; }
                });
                yPos = doc.lastAutoTable.finalY + tableSpacing;
             } else {
                 doc.setFontSize(9);
                 doc.setFont(undefined, 'italic');
                 doc.text('Žiadne príjmy v tomto období.', leftMargin, yPos);
                 yPos += lineSpacing;
            }

             // --- Stav Rozpočtov ---
             checkPageBreak(20);
             doc.setFontSize(11);
             doc.setFont(undefined, 'bold');
             doc.text('Stav rozpočtov:', leftMargin, yPos);
             yPos += lineSpacing;

             try {
                const budgetStatusData = await getBudgetStatus(selectedYear, selectedMonth);
                if (budgetStatusData.length > 0) {
                    const budgetStatusHead = [['Kategória', 'Rozpočet (€)', 'Minuté (€)', 'Zostatok (€)', '% Čerpania']];
                    const budgetStatusBody = budgetStatusData
                       .sort((a, b) => b.percentage_spent - a.percentage_spent) // Zoradenie podľa čerpania
                       .map(bs => [
                           bs.category,
                           bs.budgeted_amount.toFixed(2),
                           (bs.spent_amount * -1).toFixed(2), // Minuté záporne
                           bs.remaining_amount.toFixed(2),
                           `${Math.round(bs.percentage_spent)}%`
                       ]);
                     autoTable(doc, {
                         head: budgetStatusHead,
                         body: budgetStatusBody,
                         startY: yPos,
                         theme: 'striped',
                         headStyles: { fillColor: [190, 24, 93] }, // Výrazná ružová (pink-600)
                         styles: { fontSize: 8.5, cellPadding: 2.5 },
                         columnStyles: {
                             0: { cellWidth: 'auto'},
                             1: { halign: 'right', cellWidth: 25 },
                             2: { halign: 'right', cellWidth: 25 },
                             3: { halign: 'right', cellWidth: 25 },
                             4: { halign: 'right', cellWidth: 20 },
                         },
                         didDrawPage: (data) => { yPos = data.cursor.y; }
                     });
                     yPos = doc.lastAutoTable.finalY + tableSpacing;
                 } else {
                     doc.setFontSize(9);
                     doc.setFont(undefined, 'italic');
                     doc.text('Pre toto obdobie nie sú nastavené žiadne rozpočty.', leftMargin, yPos);
                     yPos += lineSpacing;
                 }
             } catch (err) {
                 doc.setFontSize(9);
                 doc.setTextColor(220, 38, 38); // Červená (red-600)
                 doc.text('Chyba pri načítaní stavu rozpočtov.', leftMargin, yPos);
                 doc.setTextColor(0, 0, 0);
                 yPos += lineSpacing;
                 console.error("Error fetching budget status for PDF:", err);
             }

             // --- Stav Pravidla 50/30/20 ---
             checkPageBreak(35); // Potrebujeme viac miesta
             doc.setFontSize(11);
             doc.setFont(undefined, 'bold');
             doc.text('Pravidlo 50/30/20:', leftMargin, yPos);
             yPos += lineSpacing;

             try {
                 const ruleStatusData = await getRuleStatus(selectedYear, selectedMonth);
                 if (ruleStatusData && typeof ruleStatusData.total_income === 'number') {
                     doc.setFontSize(9);
                     doc.setFont(undefined, 'normal');
                     const incomeText = `Celkový príjem (obdobie): ${formatCurrency(ruleStatusData.total_income)}`;
                     doc.text(incomeText, leftMargin, yPos);
                     yPos += lineSpacing;

                     const drawRuleRow = (name, target, actualPercent, actualAmount) => {
                         checkPageBreak(lineSpacing * 1.2);
                         const text = `${name}:`;
                         const stats = `${actualPercent.toFixed(1)}% (z ${target}%) | ${formatCurrency(actualAmount * -1)}`;
                         doc.setFont(undefined, 'bold');
                         doc.text(text, leftMargin + 5, yPos);
                         doc.setFont(undefined, 'normal');
                         doc.text(stats, leftMargin + 45, yPos);
                         yPos += lineSpacing * 1.2;
                     };

                     drawRuleRow('Potreby (Needs)', 50, ruleStatusData.needs?.spent_percent || 0, ruleStatusData.needs?.spent_amount || 0);
                     drawRuleRow('Priania (Wants)', 30, ruleStatusData.wants?.spent_percent || 0, ruleStatusData.wants?.spent_amount || 0);
                     drawRuleRow('Úspory/Invest. (Výdavky)', 20, ruleStatusData.savings_expenses?.spent_percent || 0, ruleStatusData.savings_expenses?.spent_amount || 0);

                     if (ruleStatusData.unclassified_amount > 0) {
                          checkPageBreak(lineSpacing);
                          doc.text(`Nezaradené výdavky: ${formatCurrency(ruleStatusData.unclassified_amount*-1)}`, leftMargin + 5, yPos);
                          yPos += lineSpacing;
                     }
                     yPos += tableSpacing * 0.5;

                 } else {
                     throw new Error("Invalid rule status data received.");
                 }

             } catch(err) {
                 checkPageBreak(lineSpacing);
                 doc.setFontSize(9);
                 doc.setTextColor(220, 38, 38); // Červená
                 doc.text('Chyba pri načítaní stavu pravidla 50/30/20.', leftMargin, yPos);
                 doc.setTextColor(0, 0, 0);
                 yPos += lineSpacing;
                 console.error("Error fetching/displaying rule status for PDF:", err);
             }

            // --- Uloženie PDF ---
            const filename = `financny_prehlad_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`;
            doc.save(filename);
            console.log("PDF report generated:", filename);

        } catch (err) {
            console.error("Error generating PDF:", err);
            setError('Nepodarilo sa vygenerovať PDF report.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="mt-8 mb-6 text-center sm:text-right">
             {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <button
                onClick={generateMonthlyReport}
                disabled={isGenerating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                         Generujem PDF...
                    </>
                ) : (
                    <>
                         <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                         Stiahnuť Mesačný Report (PDF)
                     </>
                )}
            </button>
        </div>
    );
};

export default ReportGenerator;