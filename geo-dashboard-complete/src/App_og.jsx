import { useState } from 'react';
import { MapContainer, TileLayer, ImageOverlay, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState('');
  const [activeGroundFeature, setActiveGroundFeature] = useState('');
  const [opacities, setOpacities] = useState({
    Turbidity: 1,
    Detritus: 1,
    CDOM: 1,
    'Dissolved Oxygen': 1,
    'CHI-a MAP': 1,
    'Water Temperature': 1,
  });
  const [activePanel, setActivePanel] = useState('');
  const [showStats, setShowStats] = useState(true);

  const groundTruthFeatures = ['Turbidity', 'Detritus', 'CDOM', 'Dissolved Oxygen'];
  const monitoredFeatures = ['Turbidity', 'Detritus', 'CDOM', 'Dissolved Oxygen', 'CHI-a MAP', 'Water Temperature'];

  const stats = {
    Area: 151.2,
    'Area ID': 1,
    'Centre Latitude': -13.71,
    'Centre Longitude': -53.58,
    Turbidity: 25.0,
    Detritus: 31.0,
    'Dissolved Oxygen': 65.0,
    Temperature: 85.0,
    CDOM: 118.0,
  };

  const handleOpacityChange = (f, value) => {
    setOpacities((prev) => ({ ...prev, [f]: value }));
  };

  const overlaySources = {
    'Turbidity': '/turbidity_overlay.png',
    'Detritus': '/detritus_overlay.png',
    'CHI-a MAP': '/chi-a_map_overlay.png'
  };

  const overlayBounds = [[1.38117, 103.86209], [1.45051, 103.98916]];

  function StickyStats() {
    useMapEvents({
      zoomend: () => setShowStats(true),
      moveend: () => setShowStats(true)
    });
    return null;
  }

  return (
    <div className="flex h-screen font-sans relative bg-gray-100">
      {/* Sidebar */}
      <div className={`${activePanel === 'water' ? 'w-20' : 'w-64'} transition-all duration-500 bg-[#1e293b] text-white flex flex-col justify-between shadow-lg z-30`}>
        <div>
          <div className="p-4 text-xl font-bold border-b border-gray-700">Geo-Insights</div>
          <div className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'project' ? 'bg-[#334155]' : ''}`} onClick={() => setActivePanel('project')}>
            📍<span className="ml-2">Project Area</span>
          </div>
          <div className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'water' ? 'bg-green-700' : ''}`} onClick={() => setActivePanel('water')}>
            📊<span className="ml-2">Water Quality Monitoring</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">
            ⚙️ <span className="ml-2">Settings</span>
          </div>
          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">
            🔒 <span className="ml-2">Log out</span>
          </div>
          <div className="text-center text-xs text-red-400 pb-2">ST Engineering</div>
        </div>
      </div>

      {/* Feature Panel */}
      {activePanel === 'water' && (
        <div className="w-72 bg-white border-r border-gray-200 text-sm p-6 overflow-y-auto z-20 shadow-md">
          <h2 className="text-xl font-bold mb-6 text-gray-700">← Water Quality Monitoring</h2>

          {/* Ground Truth */}
          <div>
            <h3 className="text-green-800 font-semibold mb-4">Ground Truth</h3>
            <div className="space-y-3">
              {groundTruthFeatures.map((f) => (
                <label key={f} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md shadow-sm hover:bg-gray-200">
                  <span className="text-gray-700 font-medium">{f}</span>
                  <input
                    type="checkbox"
                    checked={activeGroundFeature === f}
                    onChange={() => setActiveGroundFeature(f)}
                    className="form-checkbox h-4 w-4 text-green-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Features Monitored */}
          <div>
            <h3 className="text-green-800 font-semibold mb-4">Features Monitored</h3>
            <div className="space-y-6">
              {monitoredFeatures.map((f) => (
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
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>0</span><span>200.00</span>
                      </div>
                      <div className="text-right text-[10px] text-gray-400 italic pt-1">unit</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 p-5 border border-gray-300 rounded-lg bg-white shadow-md">
              <h3 className="text-md font-bold mb-3 text-gray-700">📊 Statistics</h3>
              <ul className="space-y-2">
                {Object.entries(stats).map(([key, value]) => (
                  <li key={key} className="flex justify-between text-sm text-gray-600">
                    <span>{key}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative z-10">
        <MapContainer center={[1.42, 103.92]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <StickyStats />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
          {overlaySources[activeFeature] && (
            <ImageOverlay
              url={overlaySources[activeFeature]}
              bounds={overlayBounds}
              opacity={opacities[activeFeature] || 0.5}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
