// Sidebar.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Sidebar({
  selectedDate, setSelectedDate,
  availableDates,
  selectedField, setSelectedField,
  showDynamic, setShowDynamic,
  ports, filteredData,
  selectedMMSI, setSelectedMMSI,
  mmsiList
}) {
  return (
    <div className="w-72 p-4 space-y-4 z-50 bg-[#1e293b] text-white overflow-y-auto">
      <h2 className="text-xl font-bold">AIS Analysis</h2>
      <label>
        <input type="checkbox" checked={showDynamic} onChange={() => setShowDynamic(!showDynamic)} /> Show Congestion Metrics
      </label>

      {showDynamic && (
        <>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            includeDates={availableDates}
            openToDate={availableDates.length ? availableDates[0] : new Date()}
            placeholderText="Select a valid date"
            className="text-black p-1 rounded mt-2"
            dateFormat="yyyy-MM-dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            inline
          />
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
        </>
      )}

      <div className="mt-4">
        <label>Select MMSI Voyage:</label>
        <select
          value={selectedMMSI || ""}
          onChange={(e) => setSelectedMMSI(e.target.value)}
          className="text-black p-1 rounded mt-2 w-full"
        >
          <option value="">-- Select MMSI --</option>
          {mmsiList.map((mmsi, idx) => (
            <option key={idx} value={mmsi}>{mmsi}</option>
          ))}
        </select>
      </div>

      <p>Static Ports: {ports.length}</p>
      <p>Filtered Dynamic Ports: {filteredData.length}</p>
    </div>
  );
}
