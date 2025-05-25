import React from 'react';
import stationData from './data/station_metadata.json'; // ✅ assumes this file exists

const regions = [
  { label: 'East Johar Strait', code: 'EJS' },
  { label: 'West Johar Strait', code: 'WJS' },
  { label: 'Singapore Strait', code: 'SGS' },
];

const variableOptions = [
  '$G_g$', '$S_g$', '$G_g+G_d$', '$S_d$', '$G_d$', '$S_dg$',
  '$P_0$', '$P_1$', '$\\eta$', '$\\chi$'
];

export default function Sidebar({
  selectedRegion,
  selectedStation,
  onRegionClick,
  onStationClick,
  selectedVariable,
  onVariableChange
}) {
  const filteredStations = stationData
    .filter((s) => s.Region === selectedRegion)
    .map((s) => s.Station);

  return (
    <div className="w-64 bg-[#1e293b] text-white p-4 space-y-6 overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold mb-4">Locations</h2>
        {regions.map((r) => (
          <div
            key={r.code}
            className={`cursor-pointer p-2 rounded hover:bg-[#334155] ${selectedRegion === r.code ? 'bg-green-700' : ''}`}
            onClick={() => onRegionClick(r.code)}
          >
            {r.label}
          </div>
        ))}
      </div>

      {selectedRegion && (
        <div className="mt-4">
          <h3 className="text-sm text-green-300 mb-1">Stations:</h3>
          <div className="space-y-1">
            {filteredStations.map((station) => (
              <div
                key={station}
                className={`cursor-pointer px-3 py-1 rounded ${selectedStation === station ? 'bg-green-500 text-black' : 'bg-white text-black'} hover:bg-green-300`}
                onClick={() => onStationClick(station)}
              >
                {station}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Select Variable</h2>
        <select
          className="w-full bg-gray-800 text-white p-2 rounded"
          value={selectedVariable}
          onChange={(e) => onVariableChange(e.target.value)}
        >
          {variableOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
