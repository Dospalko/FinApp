import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Paleta inšpirovaná Revolutom (mix tmavších a výraznejších)
const REVOLUT_INSPIRED_COLORS = [
  '#6D28D9', // Violet 700
  '#4F46E5', // Indigo 600
  '#0D9488', // Teal 600
  '#EC4899', // Pink 500
  '#F59E0B', // Amber 500
  '#10B981', // Emerald 500
  '#3B82F6', // Blue 500
  '#8B5CF6', // Violet 500
  '#D946EF', // Fuchsia 500
  '#06B6D4', // Cyan 500
  '#EF4444', // Red 500
  '#6B7280', // Slate 500
];

const generateColors = (numColors) => {
  return Array.from({ length: numColors }, (_, i) => REVOLUT_INSPIRED_COLORS[i % REVOLUT_INSPIRED_COLORS.length]);
};

const ExpenseChart = ({ chartData }) => {
  if (!chartData || chartData.labels.length === 0) {
    return null; // Nezobrazuj nič, ak nie sú dáta
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Výdavky (€)',
        data: chartData.data,
        backgroundColor: generateColors(chartData.labels.length),
        borderColor: '#ffffff', // Biele okraje
        borderWidth: 2, // Trochu hrubšie okraje
        hoverOffset: 8 // Zvýraznenie segmentu pri hoveri
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Legenda dole
         labels: {
             boxWidth: 12,
             padding: 20,
             font: { size: 11 },
             color: '#475569' // tmavšia sivá pre text legendy (slate-600)
         }
      },
      tooltip: {
        backgroundColor: '#334155', // Tmavé pozadie tooltipu (slate-700)
        titleColor: '#cbd5e1', // Svetlý nadpis tooltipu (slate-300)
        bodyColor: '#e2e8f0', // Svetlý text tooltipu (slate-200)
        padding: 10,
        cornerRadius: 4,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) { label += ': '; }
            if (context.parsed !== null) {
              // Formátovanie bez znamienka mínus
              label += new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(context.parsed);
            }
            return label;
          }
        }
      },
    },
    cutout: '65%', // Väčšia diera v strede
    animation: {
      animateScale: true, // Animácia zväčšenia pri načítaní
      animateRotate: true // Animácia rotácie pri načítaní
    }
  };

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;