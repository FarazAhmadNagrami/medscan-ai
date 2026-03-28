"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Disclaimer from "@/components/Disclaimer";

interface VitalsEntry {
  date: string;
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  bloodSugar?: number;
  weight?: number;
  heartRate?: number;
  bmi?: number;
}

const FIELDS = [
  { key: "bloodPressureSys", label: "BP Systolic", unit: "mmHg", color: "#ef4444", min: 60, max: 200 },
  { key: "bloodPressureDia", label: "BP Diastolic", unit: "mmHg", color: "#f97316", min: 40, max: 130 },
  { key: "bloodSugar", label: "Blood Sugar", unit: "mg/dL", color: "#eab308", min: 50, max: 400 },
  { key: "weight", label: "Weight", unit: "kg", color: "#3b82f6", min: 20, max: 300 },
  { key: "heartRate", label: "Heart Rate", unit: "bpm", color: "#ec4899", min: 30, max: 220 },
  { key: "bmi", label: "BMI", unit: "", color: "#8b5cf6", min: 10, max: 60 },
];

function getNormalRange(key: string): { min: number; max: number; label: string } | null {
  const ranges: Record<string, { min: number; max: number; label: string }> = {
    bloodPressureSys: { min: 90, max: 120, label: "Normal: 90–120 mmHg" },
    bloodPressureDia: { min: 60, max: 80, label: "Normal: 60–80 mmHg" },
    bloodSugar: { min: 70, max: 100, label: "Normal fasting: 70–100 mg/dL" },
    heartRate: { min: 60, max: 100, label: "Normal: 60–100 bpm" },
    bmi: { min: 18.5, max: 24.9, label: "Normal: 18.5–24.9" },
  };
  return ranges[key] ?? null;
}

export default function VitalsTracker() {
  const [entries, setEntries] = useState<VitalsEntry[]>([]);
  const [form, setForm] = useState<Partial<VitalsEntry>>({ date: new Date().toISOString().split("T")[0] });
  const [activeChart, setActiveChart] = useState("bloodPressureSys");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vitals_history") ?? "[]");
    setEntries(stored);
  }, []);

  const saveEntry = () => {
    if (!form.date) return;
    const updated = [...entries.filter((e) => e.date !== form.date), form as VitalsEntry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setEntries(updated);
    localStorage.setItem("vitals_history", JSON.stringify(updated));
    setForm({ date: new Date().toISOString().split("T")[0] });
  };

  const deleteEntry = (date: string) => {
    const updated = entries.filter((e) => e.date !== date);
    setEntries(updated);
    localStorage.setItem("vitals_history", JSON.stringify(updated));
  };

  const latest = entries[entries.length - 1];
  const chartField = FIELDS.find((f) => f.key === activeChart)!;
  const normalRange = getNormalRange(activeChart);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">📈</span> Vitals Tracker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Log your daily health metrics and track trends over time.
        </p>
      </div>

      {/* Log entry form */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📝 Log Today&apos;s Vitals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="col-span-2 sm:col-span-3">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Date</label>
            <input
              type="date"
              value={form.date ?? ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
                {field.label} {field.unit && `(${field.unit})`}
              </label>
              <input
                type="number"
                placeholder="—"
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
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Save Entry
        </button>
      </div>

      {/* Latest values */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {FIELDS.map((field) => {
            const val = (latest as unknown as Record<string, unknown>)[field.key] as number | undefined;
            if (!val) return null;
            const range = getNormalRange(field.key);
            const isNormal = range ? val >= range.min && val <= range.max : true;
            return (
              <div key={field.key} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.label}</div>
                <div className="text-2xl font-bold" style={{ color: field.color }}>
                  {val} <span className="text-sm font-normal text-gray-500">{field.unit}</span>
                </div>
                {range && (
                  <div className={`text-xs mt-1 font-medium ${isNormal ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isNormal ? "✅ Normal" : "⚠️ Out of range"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {entries.length > 1 && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {FIELDS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveChart(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeChart === f.key ? "text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
                style={activeChart === f.key ? { backgroundColor: f.color } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>
          {normalRange && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{normalRange.label}</p>
          )}
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[chartField.min, chartField.max]}
                tick={{ fontSize: 11 }}
                unit={chartField.unit ? ` ${chartField.unit}` : ""}
              />
              <Tooltip
                formatter={(v) => [`${v} ${chartField.unit}`, chartField.label]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={activeChart}
                stroke={chartField.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={chartField.label}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium">Date</th>
                  {FIELDS.map((f) => (
                    <th key={f.key} className="text-left px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[...entries].reverse().map((entry) => (
                  <tr key={entry.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{entry.date}</td>
                    {FIELDS.map((f) => (
                      <td key={f.key} className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {(entry as unknown as Record<string, unknown>)[f.key] ? `${(entry as unknown as Record<string, unknown>)[f.key]} ${f.unit}` : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteEntry(entry.date)}
                        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
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
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-lg font-medium">No vitals logged yet</p>
          <p className="text-sm mt-1">Start logging above to see your trends.</p>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
