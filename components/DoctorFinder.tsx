"use client";

import { useState } from "react";

interface DoctorFinderProps {
  specialty?: string;
}

export default function DoctorFinder({ specialty }: DoctorFinderProps) {
  const [show, setShow] = useState(false);

  const query = specialty
    ? `${specialty} doctor near me`
    : "doctor near me";

  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          📍 Find Nearby {specialty ? `${specialty}s` : "Doctors"}
        </h3>
        <button
          onClick={() => setShow(!show)}
          className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {show ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {show && (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
          <iframe
            src={mapsUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Find nearby doctors"
          />
        </div>
      )}

      {!show && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click &quot;Show Map&quot; to find{" "}
          {specialty ? `${specialty}s` : "doctors"} near your location.
        </p>
      )}
    </div>
  );
}
