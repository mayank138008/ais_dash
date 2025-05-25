import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function MainDashboard() {
  const [ports, setPorts] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedField, setSelectedField] = useState("avg_loading_rate_mph");
  const [monthlyAverages, setMonthlyAverages] = useState({});
  const [showDynamic, setShowDynamic] = useState(false); // 🚀 Toggle for dynamic data
  const [zoomChart, setZoomChart] = useState(false);


  // Load static ports data
  useEffect(() => {
    Papa.parse("/data/ports_near_landmass_centroids_.csv", {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cleanedPorts = result.data.map(row => ({
          port_id: row.port_id,
          port_lat: parseFloat(row.port_lat),
          port_lon: parseFloat(row.port_lon),
          port_name: row.port_name || "",
        }));
        setPorts(cleanedPorts);
      }
    });
  }, []);

  // Load dynamic data
  useEffect(() => {
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

  // Compute monthly averages
  useEffect(() => {
    if (!data.length) return;

    const averages = {};
    data.forEach(row => {
      const monthKey = `${row.port_id}_${row.date.slice(0, 7)}`;
      if (!averages[monthKey]) averages[monthKey] = { sum: 0, count: 0, lat: row.port_lat, lon: row.port_lon };
      averages[monthKey].sum += row[selectedField];
      averages[monthKey].count += 1;
    });

    const finalAverages = {};
    for (const key in averages) {
      const avg = averages[key].sum / averages[key].count;
      finalAverages[key] = { avg, lat: averages[key].lat, lon: averages[key].lon };
    }

    setMonthlyAverages(finalAverages);
  }, [data, selectedField]);

  // Filter data by selected date
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
        <h2 className="text-xl font-bold">AIS Analysis</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={showDynamic}
              onChange={() => setShowDynamic(!showDynamic)}
            /> Show Congestion Metrics
          </label>
        </div>
        
        
        {/* <div>
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
        </div> */}

        <div>
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            includeDates={availableDates}
            openToDate={availableDates.length ? availableDates[0] : new Date()}  // 🚀 Open on earliest date
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
          <label>Select Field for Chart & Size:</label>
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

        {/* <div>
          <label>
            <input
              type="checkbox"
              checked={showDynamic}
              onChange={() => setShowDynamic(!showDynamic)}
            /> Show Dynamic Data
          </label>
        </div> */}

        <p>Static Ports: {ports.length}</p>
        <p>Filtered Dynamic Ports: {filteredData.length}</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {/* Always show static ports */}
          {ports.map((port, idx) => (
            <CircleMarker
              key={`static-${idx}`}
              center={[port.port_lat, port.port_lon]}
              radius={5}
              pathOptions={{ color: 'lime', fillColor: 'lime', fillOpacity: 0.6 }}
            >
              <Popup minWidth={200}>
                <div>
                  <strong>Port ID:</strong> {port.port_id}<br />
                  <strong>Port Name:</strong> {port.port_name}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Conditionally show dynamic data */}
          {showDynamic && filteredData.map((port, idx) => {
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
                <Popup minWidth={300}>
                  <div>
                    <strong>Port ID:</strong> {port.port_id}<br />
                    <strong>Date:</strong> {port.date}<br />
                    <strong>Avg Monthly {selectedField}:</strong> {avgData ? avgData.avg.toFixed(2) : "N/A"}
                  </div>
                  {/* <div className="mt-4">
                    <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} height={200} />
                  </div> */}
                {/* ======================================================= */}
                {/* <div className="mt-4 bg-gray-900 p-4 rounded-lg w-[400px] h-[300px]">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          enabled: true,
                          mode: 'nearest',
                          intersect: false,
                          callbacks: {
                            label: (context) => `Value: ${context.parsed.y.toFixed(2)}`,
                          },
                        },
                        legend: { display: false },
                      },
                      scales: {
                        x: {
                          ticks: {
                            autoSkip: true,
                            maxTicksLimit: 8,
                            rotation: 45,
                            color: '#fff',
                          },
                          grid: {
                            color: 'rgba(255,255,255,0.1)',
                          },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: { color: '#fff' },
                          grid: { color: 'rgba(255,255,255,0.1)' },
                        },
                      },
                      elements: {
                        point: {
                          radius: 5,
                          hoverRadius: 8,
                          backgroundColor: '#38bdf8', // Tailwind cyan-400
                          borderColor: '#fff',
                          borderWidth: 1,
                        },
                        line: {
                          tension: 0.3, // Smooth the line a bit
                          borderWidth: 2,
                          borderColor: '#38bdf8',
                        },
                      },
                    }}
                  />
                </div> */}

                {/* ======================================================= */}
                

<Popup minWidth={400} maxWidth={500}>
  <div className="bg-gray-900 text-white p-4 rounded-lg w-[400px] h-auto">
    <div>
      <strong>Port ID:</strong> {port.port_id}<br />
      <strong>Date:</strong> {port.date}<br />
      <strong>Avg Monthly {selectedField}:</strong> {avgData ? avgData.avg.toFixed(2) : "N/A"}
    </div>

    <div className="mt-4 hover:scale-150 hover:z-50 transform transition-transform duration-300 ease-in-out origin-center">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'nearest',
              intersect: false,
              callbacks: {
                label: (context) => `Value: ${context.parsed.y.toFixed(2)}`
              }
            },
            legend: { display: false }
          },
          scales: {
            x: {
              ticks: { color: '#fff', rotation: 45, maxTicksLimit: 10 },
              grid: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff' },
              grid: { color: 'rgba(255,255,255,0.1)' }
            }
          },
          elements: {
            point: { radius: 5, hoverRadius: 8, backgroundColor: '#38bdf8', borderColor: '#fff', borderWidth: 1 },
            line: { tension: 0.3, borderWidth: 2, borderColor: '#38bdf8' }
          }
        }}
        height={300}
        width={400}
      />
    </div>
  </div>
</Popup>

                {/* ======================================================= */}
                
                
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
