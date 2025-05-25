import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import { loadCSV } from '../utils/loadCSVs'; // ✅ Corrected import path
import { loadCSV } from "./utils/loadCSVs";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("2024-11-14");

  useEffect(() => {
    const fetchData = async () => {
      const csvData = await loadCSV("/data/unified_port_data.csv");
      setData(csvData);
      console.log("✅ Loaded CSV Data:", csvData);
    };
    fetchData();
  }, []);

  const filteredData = data.filter(
    (d) => d.date === selectedDate && d.port_lat && d.port_lon
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold">Layer Controls</h2>
        <div>
          Select Date:{" "}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <p>Ports Found: {filteredData.length}</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          {/* <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // attribution="© OpenStreetMap contributors"
            attribution="© OpenStreetMap contributors"
          /> */}
          
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
          {filteredData.map((port, index) => (
            <Marker key={index} position={[port.port_lat, port.port_lon]}>
              <Popup>
                <strong>Port ID:</strong> {port.port_id}
                <br />
                <strong>Date:</strong> {port.date}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
