"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import Disclaimer from "@/components/Disclaimer";
import PrintButton from "@/components/PrintButton";

interface VitalsEntry {
  id: string;
  datetime: string; // ISO string with date + time
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  bloodSugar?: number;
  cholesterol?: number;
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  weight?: number;
  bmi?: number;
}

const FIELDS = [
  {
    key: "bloodPressureSys",
    label: "BP Systolic",
    unit: "mmHg",
    color: "#ef4444",
    icon: "🩸",
    min: 60, max: 200,
    normalMin: 90, normalMax: 120,
    normalLabel: "Normal: 90–120 mmHg",
  },
  {
    key: "bloodPressureDia",
    label: "BP Diastolic",
    unit: "mmHg",
    color: "#f97316",
    icon: "🩸",
    min: 40, max: 130,
    normalMin: 60, normalMax: 80,
    normalLabel: "Normal: 60–80 mmHg",
  },
  {
    key: "bloodSugar",
    label: "Blood Sugar",
    unit: "mg/dL",
    color: "#eab308",
    icon: "🩺",
    min: 50, max: 400,
    normalMin: 70, normalMax: 100,
    normalLabel: "Normal fasting: 70–100 mg/dL",
  },
  {
    key: "cholesterol",
    label: "Cholesterol",
    unit: "mg/dL",
    color: "#84cc16",
    icon: "💉",
    min: 100, max: 400,
    normalMin: null, normalMax: 200,
    normalLabel: "Desirable: < 200 mg/dL",
  },
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    color: "#ec4899",
    icon: "❤️",
    min: 30, max: 220,
    normalMin: 60, normalMax: 100,
    normalLabel: "Normal: 60–100 bpm",
  },
  {
    key: "spo2",
    label: "SpO₂",
    unit: "%",
    color: "#06b6d4",
    icon: "🫁",
    min: 85, max: 100,
    normalMin: 95, normalMax: 100,
    normalLabel: "Normal: 95–100%",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    color: "#f43f5e",
    icon: "🌡️",
    min: 35, max: 42,
    normalMin: 36.1, normalMax: 37.2,
    normalLabel: "Normal: 36.1–37.2°C",
  },
  {
    key: "weight",
    label: "Weight",
    unit: "kg",
    color: "#3b82f6",
    icon: "⚖️",
    min: 20, max: 300,
    normalMin: null, normalMax: null,
    normalLabel: "",
  },
  {
    key: "bmi",
    label: "BMI",
    unit: "",
    color: "#8b5cf6",
    icon: "📏",
    min: 10, max: 60,
    normalMin: 18.5, normalMax: 24.9,
    normalLabel: "Normal: 18.5–24.9",
  },
];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatChartLabel(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getStatus(field: typeof FIELDS[0], val: number) {
  if (field.normalMax !== null && val > field.normalMax)
    return { label: "High", cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" };
  if (field.normalMin !== null && val < field.normalMin)
    return { label: "Low", cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" };
  if (field.normalMin !== null || field.normalMax !== null)
    return { label: "Normal", cls: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" };
  return null;
}

export default function VitalsTracker() {
  const [entries, setEntries] = useState<VitalsEntry[]>([]);
  const [form, setForm] = useState<Partial<VitalsEntry>>({
    datetime: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vitals_history_v2") ?? "[]");
    setEntries(stored);
  }, []);

  const saveEntry = () => {
    if (!form.datetime) return;
    const entry: VitalsEntry = {
      ...form as VitalsEntry,
      id: Date.now().toString(),
    };
    const updated = [...entries, entry].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
    setEntries(updated);
    localStorage.setItem("vitals_history_v2", JSON.stringify(updated));
    setForm({ datetime: new Date().toISOString().slice(0, 16) });
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("vitals_history_v2", JSON.stringify(updated));
  };

  const latest = entries[entries.length - 1];

  // Build per-field chart data
  const chartDataFor = (key: string) =>
    entries
      .filter((e) => (e as unknown as Record<string, unknown>)[key] !== undefined)
      .map((e) => ({
        time: formatChartLabel(e.datetime),
        value: (e as unknown as Record<string, unknown>)[key] as number,
      }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">📈</span> Vitals Tracker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Log readings with date &amp; time. Each metric shows its own trend chart.
        </p>
      </div>

      {/* Log form */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-10">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📝 Log a Reading</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {/* Date + Time */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-5">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={form.datetime ?? ""}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
                {field.icon} {field.label}
                {field.unit && <span className="opacity-60 ml-1">({field.unit})</span>}
              </label>
              <input
                type="number"
                placeholder="—"
                step={field.key === "temperature" || field.key === "bmi" ? "0.1" : "1"}
                value={(form as Record<string, unknown>)[field.key] as number ?? ""}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value ? parseFloat(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveEntry}
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Save Reading
        </button>
      </div>

      {/* Per-metric chart cards */}
      {entries.length > 0 && (
        <div id="vitals-charts" className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trend Charts</h2>
            <PrintButton contentId="vitals-charts" title="Vitals Report" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FIELDS.map((field) => {
              const data = chartDataFor(field.key);
              if (data.length === 0) return null;

              const latestVal = latest
                ? ((latest as unknown as Record<string, unknown>)[field.key] as number | undefined)
                : undefined;
              const status = latestVal !== undefined ? getStatus(field, latestVal) : null;

              return (
                <div
                  key={field.key}
                  className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{field.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {field.label}
                      </h3>
                    </div>
                    {latestVal !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold" style={{ color: field.color }}>
                          {latestVal}
                          <span className="text-xs font-normal text-gray-400 ml-1">{field.unit}</span>
                        </span>
                        {status && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                            {status.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {field.normalLabel && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{field.normalLabel}</p>
                  )}

                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis
                        domain={[field.min, field.max]}
                        tick={{ fontSize: 10 }}
                        unit={field.unit ? ` ${field.unit}` : ""}
                        width={60}
                      />
                      <Tooltip
                        formatter={(v) => [`${v} ${field.unit}`, field.label]}
                        labelFormatter={(l) => `Time: ${l}`}
                      />
                      {field.normalMin !== null && (
                        <ReferenceLine
                          y={field.normalMin}
                          stroke="#22c55e"
                          strokeDasharray="4 2"
                          label={{ value: `Min ${field.normalMin}`, fontSize: 9, fill: "#22c55e", position: "insideTopLeft" }}
                        />
                      )}
                      {field.normalMax !== null && (
                        <ReferenceLine
                          y={field.normalMax}
                          stroke="#f97316"
                          strokeDasharray="4 2"
                          label={{ value: `Max ${field.normalMax}`, fontSize: 9, fill: "#f97316", position: "insideTopLeft" }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={field.color}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: field.color }}
                        activeDot={{ r: 6 }}
                        name={field.label}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-right">
                    {data.length} reading{data.length !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History log */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">All Readings</h3>
            <span className="text-xs text-gray-400">{entries.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Date &amp; Time</th>
                  {FIELDS.map((f) => (
                    <th key={f.key} className="text-left px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {f.icon} {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[...entries].reverse().map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDateTime(entry.datetime)}
                    </td>
                    {FIELDS.map((f) => {
                      const val = (entry as unknown as Record<string, unknown>)[f.key] as number | undefined;
                      const status = val !== undefined ? getStatus(f, val) : null;
                      return (
                        <td key={f.key} className="px-4 py-3 whitespace-nowrap">
                          {val !== undefined ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-gray-700 dark:text-gray-300">{val} {f.unit}</span>
                              {status && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${status.cls}`}>
                                  {status.label}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium">No readings logged yet</p>
          <p className="text-sm mt-1">Fill in any vitals above with date &amp; time and click Save Reading.</p>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
