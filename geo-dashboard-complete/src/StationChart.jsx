// StationChart.jsx (Fixed parseFloat + filtered NaNs)
import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StationChart({ station, variable, timeSeries }) {
  if (!station || !variable || !timeSeries || timeSeries.length === 0) return null;

  const [animatedValues, setAnimatedValues] = useState([]);
  const currentIndex = useRef(0);

  const dates = timeSeries.map((d) => d.date);
  const rawValues = timeSeries.map((d) => parseFloat(d[variable]));
  const values = rawValues.map((v) => (isNaN(v) ? null : v));

  useEffect(() => {
    setAnimatedValues([]);
    currentIndex.current = 0;
    const interval = setInterval(() => {
      setAnimatedValues((prev) => [...prev, values[currentIndex.current]]);
      currentIndex.current++;
      if (currentIndex.current >= values.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [station, variable, timeSeries]);

  const data = {
    labels: dates.slice(0, animatedValues.length),
    datasets: [
      {
        label: `${variable} for ${station}`,
        data: animatedValues,
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.35,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333',
          font: { size: 14 }
        }
      },
      title: {
        display: true,
        text: `${variable} Over Time`,
        color: '#111',
        font: { size: 18 }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}`
        }
      }
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 10,
        bottom: 10
      }
    },
    scales: {
      x: {
        ticks: { color: '#444', maxRotation: 45, minRotation: 20 },
        grid: { display: false },
        offset: true,
      },
      y: {
        ticks: { color: '#444' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  };

  return (
    <div className="absolute bottom-4 right-4 w-[720px] h-[440px] bg-white p-4 rounded shadow-xl border border-gray-200 z-[1000]">
      <Line data={data} options={options} />
    </div>
  );
}
