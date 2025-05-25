// --------------------------------------
// 🧠 [0] IMPORTS
// --------------------------------------
import { useState } from 'react'; // React hook for state
import { MapContainer, TileLayer, ImageOverlay, useMapEvents } from 'react-leaflet'; // Leaflet components
import 'leaflet/dist/leaflet.css'; // Import Leaflet map CSS

// --------------------------------------
// 🧠 [1] MAIN COMPONENT
// --------------------------------------
export default function Dashboard() {

  // -------------------------------
  // [1.1] STATE VARIABLES
  // -------------------------------

  // Which "feature" is selected to show as overlay on map
  const [activeFeature, setActiveFeature] = useState('');

  // Which ground-truth checkbox is selected
  const [activeGroundFeature, setActiveGroundFeature] = useState('');

  // Opacity for each feature overlay (initially full opacity = 1)
  const [opacities, setOpacities] = useState({
    Turbidity: 1,
    Detritus: 1,
    CDOM: 1,
    'Dissolved Oxygen': 1,
    'CHI-a MAP': 1,
    'Water Temperature': 1,
  });

  // Currently open panel in sidebar ('project', 'water', etc.)
  const [activePanel, setActivePanel] = useState('');

  // Whether to show the floating statistics widget
  const [showStats, setShowStats] = useState(true);

  // -------------------------------
  // [1.2] CONSTANTS
  // -------------------------------

  // Ground-truth features listed in sidebar
  const groundTruthFeatures = ['Turbidity', 'Detritus', 'CDOM', 'Dissolved Oxygen'];

  // All monitored features (some of which have overlays)
  const monitoredFeatures = [
    'Turbidity', 'Detritus', 'CDOM', 'Dissolved Oxygen', 'CHI-a MAP', 'Water Temperature'
  ];

  // Pre-defined statistics to show in floating panel
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

  // -------------------------------
  // [1.3] FUNCTIONS
  // -------------------------------

  // Function to handle opacity slider changes
  const handleOpacityChange = (featureName, value) => {
    setOpacities((prev) => ({ ...prev, [featureName]: value }));
  };

  // Mapping of feature name to overlay image path
  const overlaySources = {
    Turbidity: '/turbidity_overlay.png',
    Detritus: '/detritus_overlay.png',
    'CHI-a MAP': '/chi-a_map_overlay.png'
  };

  // Lat/Lon bounding box for the overlay image
  const overlayBounds = [[1.38117, 103.86209], [1.45051, 103.98916]];

  // Custom React Leaflet component to enable map event tracking (used to control stats)
  function StickyStats() {
    useMapEvents({
      zoomend: () => setShowStats(true),
      moveend: () => setShowStats(true)
    });
    return null; // doesn't render anything visually
  }

  // --------------------------------------
  // [2] JSX RETURN STARTS HERE
  // --------------------------------------
  return (
    <div className="flex h-screen font-sans relative bg-gray-100">
      
      {/* --------------------------------
          📌 SIDEBAR (LEFT)
      -------------------------------- */}
      <div className={`${activePanel === 'water' ? 'w-40' : 'w-64'} transition-all duration-500 bg-[#1e293b] text-white flex flex-col justify-between shadow-lg z-30`}>
        
        {/* Logo and Menu */}
        <div>
          <div className="p-4 text-xl font-bold border-b border-gray-700">Geo-Insights</div>

          {/* Menu Item: Project Area */}
          <div
            className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'project' ? 'bg-[#334155]' : ''}`}
            onClick={() => setActivePanel('project')}
          >
            📍<span className="ml-2">Project Area</span>
          </div>

          {/* Menu Item: Water Quality Panel */}
          <div
            className={`flex items-center gap-2 p-4 cursor-pointer hover:bg-[#334155] ${activePanel === 'water' ? 'bg-green-700' : ''}`}
            onClick={() => setActivePanel('water')}
          >
            📊<span className="ml-2">Water Quality Monitoring</span>
          </div>
        </div>

        {/* Bottom Menu */}
        <div className="mb-4">
          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">⚙️ <span className="ml-2">Settings</span></div>
          <div className="flex items-center p-4 cursor-pointer hover:bg-[#334155]">🔒 <span className="ml-2">Log out</span></div>
          <div className="text-center text-xs text-red-400 pb-2">ST Engineering</div>
        </div>
      </div>

      {/* --------------------------------
          📌 FEATURE PANEL (Right of Sidebar)
          Only visible when activePanel === 'water'
      -------------------------------- */}
      {activePanel === 'water' && (
        <div className="w-72 bg-white border-r border-gray-200 text-sm p-6 overflow-y-auto z-20 shadow-md">
          <h2 className="text-xl font-bold mb-6 text-gray-700">← Water Quality Monitoring</h2>

          {/* Ground Truth Section */}
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

          {/* Features Monitored Section */}
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

                  {/* If selected, show opacity slider */}
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

      {/* --------------------------------
          🗺️ MAIN MAP AREA + FLOATING STATS
      -------------------------------- */}
      <div className="flex-1 relative z-10">
        <MapContainer center={[1.42, 103.92]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <StickyStats />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles © Esri"
          />
          {/* Overlay shown only if one is selected */}
          {overlaySources[activeFeature] && (
            <ImageOverlay
              url={overlaySources[activeFeature]}
              bounds={overlayBounds}
              opacity={opacities[activeFeature] || 0.5}
            />
          )}
        </MapContainer>

        {/* 📊 FLOATING STATS PANEL (Visible only when water panel is active) */}
        {activePanel === 'water' && (
          <div className="absolute bottom-4 right-4 w-64 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-[1000]">
            <h3 className="text-md font-bold mb-3 text-gray-700">📊 Statistics</h3>
            <ul className="space-y-2 text-sm">
              {Object.entries(stats).map(([key, value]) => (
                <li key={key} className="flex justify-between text-gray-600">
                  <span>{key}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
