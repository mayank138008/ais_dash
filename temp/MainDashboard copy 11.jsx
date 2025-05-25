import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MainDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedField, setSelectedField] = useState("avg_loading_rate_mph");

  useEffect(() => {
    console.log("🚀 Loading CSV Data...");

    Papa.parse("/data/unified_port_data.csv", {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cleanedData = result.data
          .map(row => {
            const dateStr = row.date?.trim();
            if (!dateStr) return null;
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj)) return null;

            return {
              port_id: row.port_id,
              port_lat: parseFloat(row.port_lat),
              port_lon: parseFloat(row.port_lon),
              avg_loading_rate_mph: parseFloat(row.avg_loading_rate_mph),
              distance_km: parseFloat(row.distance_km),
              date: dateStr,
              dateObj: dateObj,
              num_idle_vessels: parseFloat(row.num_idle_vessels),
              avg_idle_time: parseFloat(row.avg_idle_time),
              source_layer: row.source_layer,
            };
          })
          .filter(Boolean);

        setData(cleanedData);

        const uniqueDates = Array.from(new Set(cleanedData.map(d => d.date)))
          .map(date => new Date(date))
          .filter(date => !isNaN(date));

        setAvailableDates(uniqueDates);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredData([]);
      return;
    }

    const selectedDateStr = selectedDate.toISOString().slice(0, 10);
    const filtered = data.filter(row => row.date === selectedDateStr);
    setFilteredData(filtered);
  }, [data, selectedDate]);

  const getTimeSeriesForPort = (portId, field) => {
    return data
      .filter(row => row.port_id === portId)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(row => ({ date: row.date, value: row[field] }));
  };

  return (
    <div className="flex h-screen bg-[#1e293b] text-white">
      {/* Sidebar */}
      <div className="w-72 p-4 space-y-4">
        <h2 className="text-xl font-bold">Layer Controls</h2>
        <div>
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            includeDates={availableDates}
            placeholderText="Select a valid date"
            className="text-black p-1 rounded mt-2"
            dateFormat="yyyy-MM-dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            inline
          />
        </div>

        <div>
          <label>Select Field for Chart:</label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="text-black p-1 rounded mt-2 w-full"
          >
            <option value="avg_loading_rate_mph">avg_loading_rate_mph</option>
            <option value="num_idle_vessels">num_idle_vessels</option>
            <option value="avg_idle_time">avg_idle_time</option>
          </select>
        </div>

        <p>Ports Found: {filteredData.length}</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
          {filteredData.map((port, idx) => {
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
              <Marker key={idx} position={[port.port_lat, port.port_lon]}>
                <Popup minWidth={300}>
                  <div>
                    <strong>Port ID:</strong> {port.port_id}<br />
                    <strong>Date:</strong> {port.date}<br />
                    <strong>Loading Rate:</strong> {port.avg_loading_rate_mph} mph<br />
                    <strong>Idle Vessels:</strong> {port.num_idle_vessels}<br />
                    <strong>Source:</strong> {port.source_layer}
                  </div>
                  <div className="mt-4">
                    <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} height={200} />
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
