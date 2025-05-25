import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MainDashboard() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  
  useEffect(() => {
  console.log("🚀 Loading CSV Data...");

  Papa.parse("/data/unified_port_data.csv", {
    header: true,
    download: true,
    skipEmptyLines: true,
    complete: (result) => {
      console.log("🗂️ Raw Rows from CSV:", result.data);

      const cleanedData = result.data
        .map(row => {
          const dateStr = row.date?.trim();
          if (!dateStr) {
            console.warn("⚠️ Skipping row with empty date:", row);
            return null;
          }

          const dateObj = new Date(dateStr);
          if (isNaN(dateObj)) {
            console.warn("⚠️ Skipping row with invalid date:", row);
            return null;
          }

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
        .filter(Boolean); // Remove nulls

      console.log("✅ Cleaned CSV Data:", cleanedData);

      setData(cleanedData);

      const uniqueDates = Array.from(new Set(cleanedData.map(d => d.date)))
        .map(date => new Date(date))
        .filter(date => !isNaN(date));

      console.log("📅 Unique Dates for Calendar:", uniqueDates);

      setAvailableDates(uniqueDates);
    }
  });
}, []);

  // Filter ports when date changes
  useEffect(() => {
    if (!selectedDate) {
      setFilteredData([]);
      console.warn("❗ No date selected, skipping filtering.");
      return;
    }

    const selectedDateStr = selectedDate.toISOString().slice(0, 10);
    const filtered = data.filter((row) => row.date === selectedDateStr);
    console.log(`🔎 Filtered Ports for ${selectedDateStr}:`, filtered);
    setFilteredData(filtered);
  }, [data, selectedDate]);

  return (
    <div className="flex h-screen bg-[#1e293b] text-white">
      {/* Sidebar */}
      <div className="w-72 p-4 space-y-4">
        <h2 className="text-xl font-bold">Layer Controls</h2>
        <div>
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              console.log("🖱️ Selected Date:", date);
              setSelectedDate(date);
            }}
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
        <p>Ports Found: {filteredData.length}</p>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
          {filteredData.map((port, idx) => (
            <Marker key={idx} position={[port.port_lat, port.port_lon]}>
              <Popup>
                <div>
                  <strong>Port ID:</strong> {port.port_id}<br />
                  <strong>Date:</strong> {port.date}<br />
                  <strong>Loading Rate:</strong> {port.avg_loading_rate_mph} mph<br />
                  <strong>Idle Vessels:</strong> {port.num_idle_vessels}<br />
                  <strong>Source:</strong> {port.source_layer}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
