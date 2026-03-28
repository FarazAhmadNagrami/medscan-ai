"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EXERCISE_TYPES = [
  { name: "Running",      icon: "🏃", metPerKg: 9.8  },
  { name: "Walking",      icon: "🚶", metPerKg: 3.8  },
  { name: "Cycling",      icon: "🚴", metPerKg: 7.5  },
  { name: "Swimming",     icon: "🏊", metPerKg: 8.0  },
  { name: "Gym / Weights",icon: "🏋️", metPerKg: 5.0  },
  { name: "Yoga",         icon: "🧘", metPerKg: 2.5  },
  { name: "HIIT",         icon: "⚡", metPerKg: 10.0 },
  { name: "Football",     icon: "⚽", metPerKg: 7.0  },
  { name: "Basketball",   icon: "🏀", metPerKg: 8.0  },
  { name: "Dancing",      icon: "💃", metPerKg: 5.5  },
  { name: "Rowing",       icon: "🚣", metPerKg: 7.0  },
  { name: "Other",        icon: "🏅", metPerKg: 5.0  },
];

interface WorkoutEntry {
  id: string;
  date: string;         // ISO string
  exercise: string;
  icon: string;
  duration: number;     // minutes
  calories: number;
  note: string;
}

function calcCalories(metPerKg: number, duration: number, weightKg: number) {
  return Math.round((metPerKg * weightKg * duration) / 60);
}

export default function ExerciseLog() {
  const [entries, setEntries]     = useState<WorkoutEntry[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [exType, setExType]       = useState(EXERCISE_TYPES[0]);
  const [duration, setDuration]   = useState("30");
  const [weight, setWeight]       = useState("70");
  const [note, setNote]           = useState("");
  const [date, setDate]           = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("exercise_log") ?? "[]"));
  }, []);

  const save = (updated: WorkoutEntry[]) => {
    setEntries(updated);
    localStorage.setItem("exercise_log", JSON.stringify(updated));
  };

  const addEntry = () => {
    const cal = calcCalories(exType.metPerKg, parseFloat(duration) || 30, parseFloat(weight) || 70);
    const entry: WorkoutEntry = {
      id: Date.now().toString(),
      date: new Date(date).toISOString(),
      exercise: exType.name,
      icon: exType.icon,
      duration: parseFloat(duration) || 30,
      calories: cal,
      note,
    };
    save([entry, ...entries]);
    setShowForm(false);
    setNote("");
  };

  const remove = (id: string) => save(entries.filter((e) => e.id !== id));

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const total = entries
      .filter((e) => new Date(e.date).toDateString() === key)
      .reduce((s, e) => s + e.calories, 0);
    return { day: d.toLocaleDateString("en", { weekday: "short" }), calories: total };
  });

  const todayKey    = new Date().toDateString();
  const todayItems  = entries.filter((e) => new Date(e.date).toDateString() === todayKey);
  const todayCal    = todayItems.reduce((s, e) => s + e.calories, 0);
  const todayMins   = todayItems.reduce((s, e) => s + e.duration, 0);
  const totalSessions = entries.length;
  const totalCalBurned = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🏃</span> Exercise Log
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Track your workouts and monitor weekly activity.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
          + Log Workout
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Today's Calories",  value: `${todayCal} kcal`,    color: "#ef4444" },
          { label: "Today's Minutes",   value: `${todayMins} min`,    color: "#3b82f6" },
          { label: "Total Sessions",    value: totalSessions.toString(),color: "#22c55e" },
          { label: "Total Burned",      value: `${totalCalBurned} kcal`,color: "#f97316"},
        ].map((s) => (
          <div key={s.label} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">New Workout</h2>
          {/* Exercise type grid */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Exercise Type</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {EXERCISE_TYPES.map((t) => (
                <button key={t.name} onClick={() => setExType(t)}
                  className={`p-2 rounded-xl border text-center transition-colors ${exType.name === t.name ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <div className="text-xl">{t.icon}</div>
                  <div className="text-xs mt-0.5 text-gray-600 dark:text-gray-400 leading-tight">{t.name.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Your Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {/* Calorie preview */}
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
            <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              Estimated burn: <strong>{calcCalories(exType.metPerKg, parseFloat(duration) || 30, parseFloat(weight) || 70)} kcal</strong>
            </span>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Note (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Morning run in the park"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <button onClick={addEntry}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Save Workout
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Weekly chart */}
      {entries.length > 0 && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity (Calories Burned)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} kcal`, "Burned"]} />
              <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log list */}
      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <div className="text-6xl mb-4">🏃</div>
          <p className="text-lg font-medium">No workouts logged yet</p>
          <p className="text-sm mt-1">Click &quot;Log Workout&quot; to start tracking your fitness.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">All Workouts</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{e.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{e.exercise}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(e.date).toLocaleDateString([], { month: "short", day: "numeric" })} • {e.duration} min
                      {e.note && ` • ${e.note}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{e.calories} kcal</span>
                  <button onClick={() => remove(e.id)} className="text-xs text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
