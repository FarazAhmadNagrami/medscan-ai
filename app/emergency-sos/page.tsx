"use client";

import { useState } from "react";

const EMERGENCY_NUMBERS = [
  { country: "India",          police: "100", ambulance: "108", fire: "101" },
  { country: "USA",            police: "911", ambulance: "911", fire: "911" },
  { country: "UK",             police: "999", ambulance: "999", fire: "999" },
  { country: "Pakistan",       police: "15",  ambulance: "1122",fire: "16"  },
  { country: "UAE",            police: "999", ambulance: "998", fire: "997" },
  { country: "Saudi Arabia",   police: "999", ambulance: "911", fire: "998" },
  { country: "Australia",      police: "000", ambulance: "000", fire: "000" },
  { country: "Germany",        police: "110", ambulance: "112", fire: "112" },
];

export default function EmergencySOS() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const getLocation = () => {
    setLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setLocError("Could not get location. Please enable location access.");
        setLoading(false);
      }
    );
  };

  const mapsUrl = location
    ? `https://maps.google.com/maps?q=hospital+near+me&ll=${location.lat},${location.lng}&z=14&output=embed`
    : `https://maps.google.com/maps?q=hospital+near+me&output=embed`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🚨</span> Emergency SOS
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Find nearest hospitals and emergency contact numbers.</p>
      </div>

      {/* SOS Banner */}
      <div className="p-5 bg-red-600 rounded-2xl text-white mb-8 text-center">
        <p className="text-lg font-bold mb-1">🚨 In a life-threatening emergency?</p>
        <p className="text-sm opacity-90 mb-3">Call your local emergency number immediately</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="tel:108" className="px-6 py-2.5 bg-white text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors">📞 Call 108 (India)</a>
          <a href="tel:911" className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition-colors">📞 Call 911 (US/SA)</a>
          <a href="tel:999" className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl transition-colors">📞 Call 999 (UK/UAE)</a>
        </div>
      </div>

      {/* Find nearest hospital */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">📍 Nearest Hospitals</h2>
          <button onClick={getLocation} disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            {loading ? "Getting location…" : "Use My Location"}
          </button>
        </div>

        {locError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{locError}</p>}

        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
          <iframe src={mapsUrl} width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" title="Nearest hospitals" />
        </div>

        {location && (
          <a href={`https://www.google.com/maps/search/hospital/@${location.lat},${location.lng},14z`} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
            📌 Open in Google Maps →
          </a>
        )}
      </div>

      {/* Emergency numbers by country */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">📞 Emergency Numbers by Country</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {["Country", "🚔 Police", "🚑 Ambulance", "🚒 Fire"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {EMERGENCY_NUMBERS.map((c) => (
                <tr key={c.country} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.country}</td>
                  <td className="px-4 py-3"><a href={`tel:${c.police}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{c.police}</a></td>
                  <td className="px-4 py-3"><a href={`tel:${c.ambulance}`} className="text-red-600 dark:text-red-400 font-bold hover:underline">{c.ambulance}</a></td>
                  <td className="px-4 py-3"><a href={`tel:${c.fire}`} className="text-orange-600 dark:text-orange-400 font-bold hover:underline">{c.fire}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
