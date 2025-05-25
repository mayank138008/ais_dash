import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import StaticPorts from "./components/StaticPorts";
import DynamicPorts from "./components/DynamicPorts";
import FullscreenChart from "./components/FullscreenChart";
// import VoyageViewer from "./components/VoyageViewer";

// const [selectedMMSI, setSelectedMMSI] = useState("");
// const mmsiList = ["636023646", "374056000", "636018313", "636022601"];

export default function MainDashboard() {
  const [ports, setPorts] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedField, setSelectedField] = useState("avg_loading_rate_mph");
  const [monthlyAverages, setMonthlyAverages] = useState({});
  const [showDynamic, setShowDynamic] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [selectedMMSI, setSelectedMMSI] = useState(null);
  const [availableMMSIs, setAvailableMMSIs] = useState([]);

// Inside MainDashboard
  const goToNextMMSI = () => {
if (!selectedMMSI || !availableMMSIs.length) return;
const index = availableMMSIs.indexOf(selectedMMSI);
const nextIndex = (index + 1) % availableMMSIs.length;
setSelectedMMSI(availableMMSIs[nextIndex]);
};

  const goToPreviousMMSI = () => {
if (!selectedMMSI || !availableMMSIs.length) return;
const index = availableMMSIs.indexOf(selectedMMSI);
const prevIndex = (index - 1 + availableMMSIs.length) % availableMMSIs.length;
setSelectedMMSI(availableMMSIs[prevIndex]);
};


//   const [selectedMMSI, setSelectedMMSI] = useState("");
  const mmsiList = ["636023646", "374056000", "636018313", "636022601"]; // Add all available MMSI IDs here

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

    // Set available MMSIs based on known files (static for now)
    setAvailableMMSIs(["636023646", "374056000", "636018313", "636022601"]);
  }, []);

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
          }).filter(Boolean);
        setData(cleanedData);

        const uniqueDates = Array.from(new Set(cleanedData.map(d => d.date)))
          .map(date => new Date(date))
          .filter(date => !isNaN(date));
        setAvailableDates(uniqueDates);
      }
    });
  }, []);

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
    <div className="flex h-screen bg-[#1e293b] text-white relative">
      <Sidebar
        {...{
          selectedDate,
          setSelectedDate,
          availableDates,
          selectedField,
          setSelectedField,
          showDynamic,
          setShowDynamic,
          ports,
          filteredData,
          availableMMSIs,
          selectedMMSI,
          setSelectedMMSI,
        }}
      />
      {/* <Sidebar
  {...{
    selectedDate, setSelectedDate, availableDates, selectedField, setSelectedField, showDynamic, setShowDynamic,
    ports, filteredData, selectedMMSI, setSelectedMMSI, mmsiList
  }}
/> */}

{/* <Sidebar
  {...{
    selectedDate, setSelectedDate, availableDates, selectedField, setSelectedField, showDynamic, setShowDynamic,
    ports, filteredData, selectedMMSI, setSelectedMMSI, mmsiList
  }}
/>

<VoyageViewer selectedMMSI={selectedMMSI} /> */}

      <div className="flex-1">
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles © Esri" />
          <StaticPorts ports={ports} />
          {showDynamic && <DynamicPorts {...{ filteredData, monthlyAverages, selectedField, getTimeSeriesForPort, setFullscreenChart }} />}
        </MapContainer>
      </div>

      {selectedMMSI && (
        <div className="fixed bottom-4 right-4 w-[600px] h-[400px] bg-white z-50 border rounded shadow-lg">
          {/* <button className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded text-xs" onClick={() => setSelectedMMSI(null)}>Close</button> */}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button className="bg-cyan-600 text-white p-1 rounded text-xs" onClick={goToPreviousMMSI}>Prev</button>
            <button className="bg-cyan-600 text-white p-1 rounded text-xs" onClick={goToNextMMSI}>Next</button>
            <button className="bg-red-600 text-white p-1 rounded text-xs" onClick={() => setSelectedMMSI(null)}>Close</button>
            </div>
          <iframe src={`/data/mmsi_${selectedMMSI}.html`} width="100%" height="100%" style={{ border: "none" }}></iframe>
        </div>
      )}
      {selectedMMSI && (
  <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center">
    <div className="relative bg-white w-11/12 h-5/6 rounded-lg shadow-lg overflow-hidden">
      <button
        className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded z-50"
        onClick={() => setSelectedMMSI(null)}
      >
        Close
      </button>
      <iframe
        src={`/data/mmsi_${selectedMMSI}.html`}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title={`MMSI ${selectedMMSI} Voyage`}
      ></iframe>
    </div>
  </div>
)}

      <FullscreenChart {...{ fullscreenChart, setFullscreenChart }} />
    </div>
  );
}
