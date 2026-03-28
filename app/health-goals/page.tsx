"use client";

import { useState, useEffect } from "react";

interface Goal {
  id: string;
  category: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  direction: "lower" | "higher" | "reach";
  deadline: string;
  icon: string;
}

const TEMPLATES = [
  { category: "Weight",       title: "Lose weight",          unit: "kg",   direction: "lower"  as const, icon: "⚖️",  defaultTarget: 70  },
  { category: "Blood Pressure",title: "Lower BP (Systolic)", unit: "mmHg", direction: "lower"  as const, icon: "🩸",  defaultTarget: 120 },
  { category: "Blood Sugar",  title: "Control blood sugar",  unit: "mg/dL",direction: "lower"  as const, icon: "💉",  defaultTarget: 100 },
  { category: "Exercise",     title: "Walk daily",           unit: "min",  direction: "higher" as const, icon: "🚶", defaultTarget: 30  },
  { category: "Water",        title: "Drink water daily",    unit: "ml",   direction: "higher" as const, icon: "💧",  defaultTarget: 2000},
  { category: "Sleep",        title: "Sleep hours",          unit: "hrs",  direction: "higher" as const, icon: "😴",  defaultTarget: 8   },
  { category: "Steps",        title: "Daily steps",          unit: "steps",direction: "higher" as const, icon: "👟",  defaultTarget: 10000},
  { category: "BMI",          title: "Healthy BMI",          unit: "",     direction: "reach"  as const, icon: "📏",  defaultTarget: 22  },
];

function progress(goal: Goal): number {
  if (goal.direction === "lower") {
    return Math.min(100, Math.max(0, ((goal.current - goal.target) / (goal.current || 1)) * -1 * 100 + 100));
  }
  if (goal.direction === "higher") return Math.min(100, (goal.current / goal.target) * 100);
  const diff = Math.abs(goal.current - goal.target);
  return Math.max(0, 100 - (diff / goal.target) * 100);
}

export default function HealthGoals() {
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [showAdd, setShowAdd]     = useState(false);
  const [template, setTemplate]   = useState(TEMPLATES[0]);
  const [targetVal, setTargetVal] = useState(String(TEMPLATES[0].defaultTarget));
  const [currentVal, setCurrentVal] = useState("");
  const [deadline, setDeadline]   = useState("");
  const [updateId, setUpdateId]   = useState<string | null>(null);
  const [updateVal, setUpdateVal] = useState("");

  useEffect(() => {
    setGoals(JSON.parse(localStorage.getItem("health_goals") ?? "[]"));
  }, []);

  const save = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem("health_goals", JSON.stringify(updated));
  };

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      category:  template.category,
      title:     template.title,
      target:    parseFloat(targetVal),
      current:   parseFloat(currentVal) || 0,
      unit:      template.unit,
      direction: template.direction,
      deadline,
      icon:      template.icon,
    };
    save([...goals, goal]);
    setShowAdd(false);
    setCurrentVal(""); setDeadline("");
  };

  const updateProgress = (id: string) => {
    save(goals.map((g) => g.id === id ? { ...g, current: parseFloat(updateVal) || g.current } : g));
    setUpdateId(null); setUpdateVal("");
  };

  const removeGoal = (id: string) => save(goals.filter((g) => g.id !== id));

  const daysLeft = (deadline: string) => {
    if (!deadline) return null;
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return d;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🎯</span> Health Goals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Set health targets and track your progress over time.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
          + Add Goal
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">New Goal</h2>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Goal Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.title} onClick={() => { setTemplate(t); setTargetVal(String(t.defaultTarget)); }}
                  className={`p-2 rounded-xl border text-sm transition-colors text-center ${template.title === t.title ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
                  {t.icon} {t.category}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Target {template.unit && `(${template.unit})`}</label>
              <input type="number" value={targetVal} onChange={(e) => setTargetVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Current Value</label>
              <input type="number" value={currentVal} onChange={(e) => setCurrentVal(e.target.value)} placeholder="Now"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Target Date</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addGoal} disabled={!targetVal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors">
              Add Goal
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg font-medium">No goals set yet</p>
          <p className="text-sm mt-1">Click &quot;Add Goal&quot; to set your first health target.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = progress(goal);
            const days = daysLeft(goal.deadline);
            const achieved = pct >= 100;
            const barColor = achieved ? "#22c55e" : pct >= 60 ? "#3b82f6" : pct >= 30 ? "#eab308" : "#ef4444";

            return (
              <div key={goal.id} className={`p-5 bg-white dark:bg-gray-800 rounded-2xl border transition-colors ${achieved ? "border-green-400 dark:border-green-600" : "border-gray-200 dark:border-gray-700"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{goal.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{goal.category}</div>
                    </div>
                  </div>
                  {achieved && <span className="text-xs font-bold px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">✅ Done!</span>}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.current} {goal.unit} → {goal.target} {goal.unit}
                    </span>
                    <span className="font-bold" style={{ color: barColor }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                </div>

                {days !== null && (
                  <div className={`text-xs mb-3 ${days < 0 ? "text-red-500" : days < 7 ? "text-orange-500" : "text-gray-400"}`}>
                    {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? "Due today!" : `${days} days remaining`}
                  </div>
                )}

                {/* Update progress */}
                {updateId === goal.id ? (
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={updateVal} onChange={(e) => setUpdateVal(e.target.value)}
                      placeholder={`Current ${goal.unit}`}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => updateProgress(goal.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium">Update</button>
                    <button onClick={() => setUpdateId(null)} className="px-2 py-1.5 text-gray-400 text-xs">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setUpdateId(goal.id); setUpdateVal(String(goal.current)); }}
                      className="flex-1 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Update Progress
                    </button>
                    <button onClick={() => removeGoal(goal.id)} className="py-1.5 px-2 text-red-400 hover:text-red-600 text-xs transition-colors">🗑</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
