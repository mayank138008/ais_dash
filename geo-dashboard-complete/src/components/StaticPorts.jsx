import { CircleMarker, Popup } from "react-leaflet";

export default function StaticPorts({ ports }) {
  return ports.map((port, idx) => (
    <CircleMarker
      key={`static-${idx}`}
      center={[port.port_lat, port.port_lon]}
      radius={5}
      pathOptions={{ color: 'lime', fillColor: 'lime', fillOpacity: 0.6 }}
    >
      <Popup>
        <div className="bg-gray-900 text-white p-2 rounded w-72">
          <strong>Port ID:</strong> {port.port_id}<br />
          <strong>Port Name:</strong> {port.port_name}
        </div>
      </Popup>
    </CircleMarker>
  ));
}
