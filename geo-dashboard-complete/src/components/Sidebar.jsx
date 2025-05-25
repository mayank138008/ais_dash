import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Sidebar({
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
}) {
  return (
    <div className="w-72 p-4 space-y-4 z-50 bg-[#1e293b] text-white h-full shadow-md">
      <h2 className="text-xl font-bold">AIS Analysis</h2>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showDynamic}
            onChange={() => setShowDynamic(!showDynamic)}
            className="accent-cyan-500"
          />
          <span>Show Congestion Metrics</span>
        </label>

        {showDynamic && (
          <div className="space-y-4 border-t border-gray-500 pt-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Select Date:</label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                includeDates={availableDates}
                openToDate={availableDates.length ? availableDates[0] : new Date()}
                placeholderText="Select a valid date"
                className="text-black p-1 rounded mt-1 w-full"
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                inline
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Select Field for Chart & Size:</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="text-black p-1 rounded w-full"
              >
                <option value="avg_loading_rate_mph">avg_loading_rate_mph</option>
                <option value="num_idle_vessels">num_idle_vessels</option>
                <option value="avg_idle_time">avg_idle_time</option>
              </select>
            </div>
          </div>
        )}

        <div className="border-t border-gray-500 pt-4">
          <label className="text-sm font-semibold mb-1 block">Select MMSI Voyage:</label>
          <select
            value={selectedMMSI || ""}
            onChange={(e) => setSelectedMMSI(e.target.value)}
            className="text-black p-1 rounded w-full"
          >
            <option value="">-- Select MMSI --</option>
            {availableMMSIs.map((mmsi) => (
              <option key={mmsi} value={mmsi}>{mmsi}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className="border-gray-500" />
      <div className="text-sm space-y-1">
        <p>Static Ports: {ports.length}</p>
        <p>Filtered Dynamic Ports: {filteredData.length}</p>
      </div>
    </div>
  );
}
