import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";

export default function MainDashboard() {
  const [ports, setPorts] = useState([]);
  const [data, setData] = useState([]);

  // =========================================================================================
  useEffect(() => {
    // Load static ports data
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
        console.log("✅ Ports loaded:", cleanedPorts);
      }
    });
  }, []);



  // =========================================================================================
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
        console.log("✅ cleanedData:", cleanedData);
        // console.log("✅ data:", data);

        const uniqueDates = Array.from(new Set(cleanedData.map(d => d.date)))
          .map(date => new Date(date))
          .filter(date => !isNaN(date));

        setAvailableDates(uniqueDates);
      }
    });
  }, []);
  // =========================================================================================
  // Compute monthly averages when data or selectedField changes
  useEffect(() => {
    if (!data.length) return;

    const averages = {};
    data.forEach(row => {
      const monthKey = `${row.port_id}_${row.date.slice(0, 7)}`; // YYYY-MM
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

  useEffect(() => {
    if (!selectedDate) {
      setFilteredData([]);
      return;
    }

    const selectedDateStr = selectedDate.toISOString().slice(0, 10);
    const filtered = data.filter(row => row.date === selectedDateStr);
    setFilteredData(filtered);
  }, [data, selectedDate]);
  // =========================================================================================




  return (
    <div className="flex h-screen bg-[#1e293b] text-white">
      {/* Sidebar */}
      <div className="w-72 p-4 space-y-4">
        <h2 className="text-xl font-bold">Layer Controls</h2>
        <p>Ports Found: {ports.length}</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={3} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {ports.map((port, idx) => (
            <CircleMarker
              key={idx}
              center={[port.port_lat, port.port_lon]}
              radius={5}  // Fixed size, or you can add logic later for dynamic size
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
        </MapContainer>
      </div>
    </div>
  );
}
