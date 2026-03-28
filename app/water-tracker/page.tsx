"use client";

import { useState, useEffect } from "react";

const PRESETS = [
  { label: "Small Glass", ml: 150, icon: "🥛" },
  { label: "Glass",       ml: 250, icon: "🥤" },
  { label: "Mug",         ml: 350, icon: "☕" },
  { label: "Bottle",      ml: 500, icon: "💧" },
  { label: "Large",       ml: 750, icon: "🍶" },
  { label: "1 Litre",     ml: 1000,icon: "🚰" },
];

interface DrinkEntry {
  id: string;
  time: string;
  ml: number;
  label: string;
  icon: string;
}

function ProgressRing({ pct, ml, goal }: { pct: number; ml: number; goal: number }) {
  const r = 90, stroke = 14;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * c;
  const color = pct >= 100 ? "#22c55e" : pct >= 60 ? "#3b82f6" : pct >= 30 ? "#eab308" : "#e5e7eb";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        <circle cx="110" cy="110" r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} className="dark:stroke-gray-700" />
        <circle cx="110" cy="110" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${filled} ${c}`} strokeLinecap="round"
          className="transition-all duration-500" />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{ml}</div>
        <div className="text-sm text-gray-400">/ {goal} ml</div>
        <div className="text-lg font-bold mt-1" style={{ color }}>{Math.round(pct)}%</div>
        {pct >= 100 && <div className="text-sm mt-1">🎉 Goal reached!</div>}
      </div>
    </div>
  );
}

export default function WaterTracker() {
  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [goal, setGoal]       = useState(2000);
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("2000");

  const todayKey = new Date().toDateString();

  useEffect(() => {
    const stored: DrinkEntry[] = JSON.parse(localStorage.getItem("water_log") ?? "[]");
    setEntries(stored.filter((e) => new Date(e.time).toDateString() === todayKey));
    const savedGoal = localStorage.getItem("water_goal");
    if (savedGoal) { setGoal(parseInt(savedGoal)); setGoalInput(savedGoal); }
  }, [todayKey]);

  const totalMl = entries.reduce((s, e) => s + e.ml, 0);
  const pct     = (totalMl / goal) * 100;

  const addDrink = (preset: typeof PRESETS[0]) => {
    const entry: DrinkEntry = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      ml: preset.ml,
      label: preset.label,
      icon: preset.icon,
    };
    const all: DrinkEntry[] = JSON.parse(localStorage.getItem("water_log") ?? "[]");
    const updated = [entry, ...all].slice(0, 100);
    localStorage.setItem("water_log", JSON.stringify(updated));
    setEntries([entry, ...entries]);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    const all: DrinkEntry[] = JSON.parse(localStorage.getItem("water_log") ?? "[]");
    localStorage.setItem("water_log", JSON.stringify(all.filter((e) => e.id !== id)));
  };

  const saveGoal = () => {
    const g = parseInt(goalInput);
    if (g > 0) { setGoal(g); localStorage.setItem("water_goal", g.toString()); }
    setEditGoal(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">💧</span> Water Tracker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Tap a container to log your intake. Stay hydrated every day.
        </p>
      </div>

      {/* Progress ring */}
      <div className="flex flex-col items-center mb-8">
        <ProgressRing pct={pct} ml={totalMl} goal={goal} />

        <div className="flex items-center gap-2 mt-4">
          {editGoal ? (
            <>
              <input type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-sm text-gray-500">ml/day</span>
              <button onClick={saveGoal} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
            </>
          ) : (
            <button onClick={() => setEditGoal(true)} className="text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Goal: {goal}ml/day — tap to change
            </button>
          )}
        </div>
      </div>

      {/* Hydration tip */}
      <div className={`p-3 rounded-xl text-sm text-center mb-6 ${
        pct >= 100 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
        pct >= 50  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" :
                    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
      }`}>
        {pct >= 100 ? "🎉 Amazing! You've hit your daily water goal!" :
         pct >= 75  ? "💧 Almost there! Just a bit more." :
         pct >= 50  ? "👍 Halfway there — keep going!" :
         pct >= 25  ? "⚠️ You need more water today." :
                      "🚨 Very low intake — drink water now!"}
      </div>

      {/* Quick-add presets */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => addDrink(p)}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all active:scale-95">
            <span className="text-3xl">{p.icon}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.label}</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">+{p.ml}ml</span>
          </button>
        ))}
      </div>

      {/* Today's log */}
      {entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Log</h3>
            <span className="text-xs text-gray-400">{entries.length} drinks • {totalMl}ml total</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{e.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{e.label}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">+{e.ml}ml</span>
                  <button onClick={() => removeEntry(e.id)} className="text-xs text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <div className="text-5xl mb-3">💧</div>
          <p className="text-lg font-medium">No drinks logged today</p>
          <p className="text-sm mt-1">Tap a container above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
