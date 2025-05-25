import { CircleMarker, Popup } from "react-leaflet";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
export default function DynamicPorts({ filteredData, monthlyAverages, selectedField, getTimeSeriesForPort, setFullscreenChart }) {
  return filteredData.map((port, idx) => {
    const monthKey = `${port.port_id}_${port.date.slice(0,7)}`;
    const avgData = monthlyAverages[monthKey];
    const radius = avgData ? Math.max(5, avgData.avg * 0.5) : 5;
    const timeSeries = getTimeSeriesForPort(port.port_id, selectedField);
    const chartData = {
      labels: timeSeries.map(d => d.date),
      datasets: [{
        label: `${selectedField} for Port ${port.port_id}`,
        data: timeSeries.map(d => d.value),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      }]
    };

    return (
      <CircleMarker
        key={`dynamic-${idx}`}
        center={[port.port_lat, port.port_lon]}
        radius={radius}
        pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.6 }}
      >
        <Popup>
          <div className="bg-gray-900 text-white p-2 rounded w-80">
            <div>
              <strong>Port ID:</strong> {port.port_id}<br />
              <strong>Date:</strong> {port.date}<br />
              <strong>Avg Monthly {selectedField}:</strong> {avgData ? avgData.avg.toFixed(2) : "N/A"}
            </div>
            <div className="w-full h-48 mt-2">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
            <button
              className="mt-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded"
              onClick={() => setFullscreenChart({ port, chartData })}
            >
              View Fullscreen Chart
            </button>
          </div>
        </Popup>
      </CircleMarker>
    );
  });
}
