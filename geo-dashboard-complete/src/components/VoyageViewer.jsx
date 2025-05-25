// VoyageViewer.jsx
import React from "react";

export default function VoyageViewer({ selectedMMSI }) {
  if (!selectedMMSI) return null;

  const url = `/data/mmsi_${selectedMMSI}.html`;
  return (
    <div className="fixed inset-y-0 right-0 w-[40%] bg-white z-40 p-4 overflow-auto shadow-lg">
      <h2 className="text-xl font-bold mb-2">Voyage Details: {selectedMMSI}</h2>
      <iframe
        src={url}
        title={`Voyage ${selectedMMSI}`}
        className="w-full h-[90%] border"
      ></iframe>
    </div>
  );
}
