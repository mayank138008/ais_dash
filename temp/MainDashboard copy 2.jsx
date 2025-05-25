import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar.jsx';
import StationChart from './StationChart.jsx';
import stationData from './data/station_metadata.json';
import timeseriesData from './data/timeseries_data.json';
import { getImageStatsFromOverlay } from './imageStats'; // <== NEW

export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('$P_0$');

  const [activeFeature, setActiveFeature] = useState('');
  const [activePanel, setActivePanel] = useState('water');
  
  const [opacities, setOpacities] = useState({
    Turbidity: 1,
    Detritus: 1,
    CDOM: 1,
    'Dissolved Oxygen': 1,
    'CHI-a MAP': 1,
    'Water Temperature': 1,
  });

  const [showStats, setShowStats] = useState(true);
  const [stats, setStats] = useState({}); // <== NEW

  const overlaySources = {
    Turbidity: '/turbidity_overlay.png',
    Detritus: '/detritus_overlay.png',
    'CHI-a MAP': '/chi-a_map_overlay.png'
  };

  const overlayBounds = [[1.38117, 103.86209], [1.45051, 103.98916]];

  const handleOpacityChange = (featureName, value) => {
    setOpacities((prev) => ({ ...prev, [featureName]: value }));
  };

  function StickyStats() {
    useMapEvents({ zoomend: () => {}, moveend: () => {} });
    return null;
  }

  const regionStations = stationData.filter((s) => s.Region === selectedRegion);
  const stationTimeSeries = timeseriesData.filter(
    (d) => d.Region === selectedRegion && d.Station === selectedStation
  );

  const regionOptions = [
    { label: 'East Johar Strait', code: 'EJS' },
    { label: 'West Johar Strait', code: 'WJS' },
    { label: 'Singapore Strait', code: 'SGS' },
  ];

  // 💡 NEW useEffect to calculate PNG image stats
  useEffect(() => {
    async function loadStats() {
      try {
        if (activeFeature && overlaySources[activeFeature]) {
          const result = await getImageStatsFromOverlay(overlaySources[activeFeature]);

          if (!result) {
            setStats({});
            return;
          }

          setStats({
            Feature: activeFeature,
            Mean: result.mean,
            Min: result.min,
            Max: result.max,
          });
        } else {
          setStats({});
        }
      } catch (error) {
        console.error('Error while loading stats:', error);
        setStats({});
      }
    }

    loadStats();
  }, [activeFeature]);

  return (
    <div className="flex h-screen font-sans relative bg-gray-100">

      {/* ========================================================    Sidebar   ============================================= */}
      {/* Sidebar */}
      <div className={`${activePanel === 'water' ? 'w-40' : 'w-64'} transition-all duration-500 bg-[#1e293b] text-white flex flex-col justify-between shadow-lg z-30`}>
        <div>
          <div className="p-4 text-xl font-bold border-b border-gray-700">Geo-Insights</div>
          
          <div
            className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'project' ? 'bg-[#334155]' : ''}`}
            onClick={() => setActivePanel('project')}
          >📍<span className="ml-2">Project Area</span></div>

          <div
            className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'water' ? 'bg-green-700' : ''}`}
            onClick={() => setActivePanel('water')}
          >📊<span className="ml-2">Water Quality Monitoring</span></div>

        </div>

        <div className="mb-4">

          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">⚙️ <span className="ml-2">Settings</span></div>
          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">🔒 <span className="ml-2">Log out</span></div>
          <div className="text-center text-xs text-red-400 pb-2">ST Engineering</div>

        </div>
      </div>



      {/* ========================================================    Feature Panel   ============================================= */}

      {/* Feature Panel */}
      {activePanel === 'water' && (
        <div className="w-72 bg-white border-r border-gray-200 text-sm p-6 overflow-y-auto z-20 shadow-md">
          <h2 className="text-xl font-bold mb-6 text-gray-700">← Water Quality Monitoring</h2>

                          {/* ==============================    Ground Truth   ============================= */}
                          
          <div>
            <h3 className="text-green-800 font-semibold mb-4">Ground Truth</h3>
            <div className="space-y-3">
              {regionOptions.map(({ label, code }) => (
                <div
                  key={code}
                  className={`cursor-pointer px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 shadow-sm ${selectedRegion === code ? 'border-l-4 border-green-600' : ''}`}
                  onClick={() => {
                    setSelectedRegion(code);
                    setSelectedStation(null);
                  }}
                >
                  {label}
                </div>
              ))}

              {regionStations.length > 0 && (
                <div className="mt-4 ml-2 text-sm text-gray-600">
                  <h4 className="font-semibold text-gray-700 mb-2">Stations:</h4>
                  {regionStations.map(({ Station }) => (
                    <div
                      key={Station}
                      className={`cursor-pointer p-1 px-2 rounded hover:bg-green-100 ${selectedStation === Station ? 'bg-green-200' : ''}`}
                      onClick={() => setSelectedStation(Station)}
                    >
                      {Station}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

                          {/* ==============================    Features Monitored   ============================= */}

          <div>
            <h3 className="text-green-800 font-semibold mb-4">Features Monitored</h3>
            <div className="space-y-6">
              {Object.keys(opacities).map((f) => (
                <div key={f} className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700 font-medium">{f}</span>
                    <input
                      type="checkbox"
                      checked={activeFeature === f}
                      onChange={() => setActiveFeature(f)}
                      className="form-checkbox text-green-600 h-4 w-4"
                    />
                  </div>
                  {activeFeature === f && (
                    <>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={opacities[f]}
                        onChange={(e) => handleOpacityChange(f, parseFloat(e.target.value))}
                        className="w-full h-2 mt-1 mb-2 rounded-lg appearance-none cursor-pointer bg-green-200"
                      />
                      <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-300 to-green-500 rounded"></div>
                      <div className="flex justify-between text-[10px] text-gray-500"><span>0</span><span>200.00</span></div>
                      <div className="text-right text-[10px] text-gray-400 italic pt-1">unit</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================    Map & Panels   ============================================= */}

      {/* Map & Panels */}
      <div className="flex-1 relative z-10">
        <MapContainer center={[1.42, 103.92]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <StickyStats />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />

          {regionStations
            .filter(s => s.Latitude && s.Longitude)
            .map(({ Station, Latitude, Longitude }) => (
              <Marker
                key={Station}
                position={[Latitude, Longitude]}
                eventHandlers={{ click: () => setSelectedStation(Station) }}
              >
                <Popup><strong>{Station}</strong></Popup>
              </Marker>
            ))}

          {overlaySources[activeFeature] && (
            <ImageOverlay
              url={overlaySources[activeFeature]}
              bounds={overlayBounds}
              opacity={opacities[activeFeature] || 0.5}
            />
          )}
        </MapContainer>

      {/* ========================================================    Floating Stats Panel   ============================================= */}

        {/* Floating Stats Panel */}
        {activePanel === 'water' && showStats && (
          <div className="absolute bottom-4 left-4 w-64 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-[2000]">
            <h3 className="text-md font-bold mb-3 text-gray-700">📊 Statistics</h3>
            <ul className="space-y-2 text-sm">
              {stats && Object.keys(stats).length > 0 ? (
                Object.entries(stats).map(([key, value]) => (
                  <li key={key} className="flex justify-between text-gray-600">
                    <span>{key}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">Loading or unavailable</li>
              )}
            </ul>
          </div>
        )}
      {/* ========================================================    Station Time Series   ============================================= */}

        {/* Station Time Series */}
        {selectedStation && (
          <div className="absolute bottom-4 right-4 w-96 bg-white p-4 rounded shadow-xl border border-gray-200 z-[1000]">
            <StationChart
              station={selectedStation}
              variable={selectedVariable}
              timeSeries={stationTimeSeries}
            />
          </div>
        )}
      </div>
    </div>
  );
}
