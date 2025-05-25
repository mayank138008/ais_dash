import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
export default function FullscreenChart({ fullscreenChart, setFullscreenChart }) {
  if (!fullscreenChart) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center">
      <div className="relative bg-gray-900 text-white p-4 rounded-lg max-w-5xl w-11/12 h-5/6 overflow-auto">
        <button className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded" onClick={() => setFullscreenChart(null)}>Close</button>
        <h2 className="text-lg font-bold mb-4">Port ID: {fullscreenChart.port.port_id}</h2>
        <Line
          data={fullscreenChart.chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { tooltip: { enabled: true }, legend: { display: false } },
            scales: { x: { ticks: { color: '#fff', rotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } } }
          }}
        />
      </div>
    </div>
  );
}
