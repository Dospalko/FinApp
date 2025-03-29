// src/components/ExpenseChart/ExpenseChart.jsx
import React from 'react';
// Importujeme špecifický typ grafu a potrebné prvky z Chart.js
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, // Potrebné pre Doughnut/Pie grafy
  Tooltip,    // Pre zobrazenie info pri hoveri
  Legend      // Pre legendu grafu
} from 'chart.js';

// Musíme zaregistrovať prvky, ktoré budeme používať
ChartJS.register(ArcElement, Tooltip, Legend);

// Funkcia na generovanie náhodných (alebo preddefinovaných) farieb pre graf
const generateColors = (numColors) => {
  // Môžeš použiť preddefinovanú paletu alebo generátor
  const colors = [
    '#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6',
    '#D946EF', '#06B6D4', '#EF4444', '#6B7280', '#6EE7B7', '#FCD34D',
  ];
  // Opakuj farby, ak je kategórií viac ako farieb v palete
  return Array.from({ length: numColors }, (_, i) => colors[i % colors.length]);
};

const ExpenseChart = ({ chartData }) => {
  // chartData očakávame ako objekt: { labels: ['Kat1', 'Kat2'], data: [100, 50] }

  if (!chartData || chartData.labels.length === 0) {
    return <p className="text-center text-slate-500 py-4">Žiadne dáta na zobrazenie v grafe.</p>;
  }

  // Pripravíme dáta pre Chart.js
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Výdavky podľa kategórií (€)', // Označenie datasetu
        data: chartData.data,
        backgroundColor: generateColors(chartData.labels.length), // Generované farby
        borderColor: '#ffffff', // Biela farba okrajov segmentov
        borderWidth: 1,
      },
    ],
  };

  // Možnosti konfigurácie grafu
  const options = {
    responsive: true, // Graf sa prispôsobí veľkosti kontajnera
    maintainAspectRatio: false, // Dôležité, ak chceme nastaviť výšku kontajnerom
    plugins: {
      legend: {
        position: 'top', // Pozícia legendy (top, bottom, left, right)
         labels: {
             boxWidth: 12, // Menšie štvorčeky farieb
             padding: 15, // Odsadenie legendy
             font: {
                 size: 10 // Menšie písmo legendy
             }
         }
      },
      tooltip: {
        callbacks: {
          // Formátovanie tooltipu - pridá menu (€)
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(context.parsed);
            }
            return label;
          }
        }
      },
      // Môžeme pridať aj nadpis grafu
    //   title: {
    //     display: true,
    //     text: 'Rozdelenie výdavkov podľa kategórií',
    //     font: { size: 16 }
    //   }
    },
    cutout: '60%', // Pre Doughnut graf - veľkosť "diery" v strede (%)
  };

  return (
    // Nastavíme výšku kontajnera pre graf
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;