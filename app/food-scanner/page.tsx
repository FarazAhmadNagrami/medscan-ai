"use client";

import { useState, useCallback, useEffect } from "react";
import ImageSourcePicker from "@/components/ImageSourcePicker";
import { callGeminiWithImage, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import Disclaimer from "@/components/Disclaimer";

interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MealResult {
  meal_name: string;
  items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  health_rating: "excellent" | "good" | "moderate" | "poor";
  health_note: string;
}

interface LogEntry {
  id: string;
  time: string;
  meal_name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  imageUrl?: string;
}

const HEALTH_COLORS = {
  excellent: { bg: "bg-green-50 dark:bg-green-900/20",  badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",  bar: "#22c55e" },
  good:      { bg: "bg-blue-50 dark:bg-blue-900/20",    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",      bar: "#3b82f6" },
  moderate:  { bg: "bg-yellow-50 dark:bg-yellow-900/20",badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",bar: "#eab308" },
  poor:      { bg: "bg-red-50 dark:bg-red-900/20",      badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",          bar: "#ef4444" },
};

function MacroRing({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" className="dark:stroke-gray-700" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(pct / 100) * c} ${c}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
        <text x="36" y="38" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor" className="fill-gray-900 dark:fill-white">{value}</text>
      </svg>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <span className="text-xs text-gray-400">{unit}</span>
    </div>
  );
}

export default function FoodScanner() {
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<MealResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [log, setLog]           = useState<LogEntry[]>([]);
  const [dailyGoal]             = useState(2000);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored: LogEntry[] = JSON.parse(localStorage.getItem("food_log") ?? "[]");
    setLog(stored.filter((e) => new Date(e.time).toDateString() === today));
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const prompt = `You are a nutrition expert AI like cal.ai. Analyze this food/meal photo precisely. Identify every food item visible. Return JSON with:
- meal_name (string, descriptive name of the meal)
- items (array of {name, portion, calories, protein, carbs, fat, fiber} — all numbers in grams except calories)
- total_calories (number)
- total_protein (number, grams)
- total_carbs (number, grams)
- total_fat (number, grams)
- total_fiber (number, grams)
- health_rating (one of: excellent, good, moderate, poor)
- health_note (one sentence about the nutritional quality)
Be as accurate as possible based on visual portion sizes.`;
        const raw    = await callGeminiWithImage(dataUrl.split(",")[1], file.type, prompt);
        const parsed = parseJSON<MealResult>(raw);
        if (!parsed) throw new Error("Could not identify food items");
        setResult(parsed);

        // Save to log
        const entry: LogEntry = {
          id: Date.now().toString(),
          time: new Date().toISOString(),
          meal_name: parsed.meal_name,
          total_calories: parsed.total_calories,
          total_protein:  parsed.total_protein,
          total_carbs:    parsed.total_carbs,
          total_fat:      parsed.total_fat,
          imageUrl: dataUrl,
        };
        const all: LogEntry[] = JSON.parse(localStorage.getItem("food_log") ?? "[]");
        const updated = [entry, ...all].slice(0, 50);
        localStorage.setItem("food_log", JSON.stringify(updated));
        const today = new Date().toDateString();
        setLog(updated.filter((e) => new Date(e.time).toDateString() === today));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not analyze meal");
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }, []);

  const todayCalories = log.reduce((s, e) => s + e.total_calories, 0);
  const todayProtein  = log.reduce((s, e) => s + e.total_protein,  0);
  const todayCarbs    = log.reduce((s, e) => s + e.total_carbs,    0);
  const todayFat      = log.reduce((s, e) => s + e.total_fat,      0);
  const calPct = Math.min(100, (todayCalories / dailyGoal) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🍽️</span> Food Calorie Scanner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Snap a photo of any meal — AI instantly identifies every item and calculates full nutrition.
        </p>
      </div>

      {/* Daily summary */}
      {log.length > 0 && (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Intake</h2>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{todayCalories} / {dailyGoal} kcal</span>
          </div>
          {/* Calorie progress bar */}
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${calPct}%`, backgroundColor: calPct > 100 ? "#ef4444" : calPct > 80 ? "#f97316" : "#22c55e" }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Protein", value: Math.round(todayProtein), color: "#3b82f6", unit: "g" },
              { label: "Carbs",   value: Math.round(todayCarbs),   color: "#eab308", unit: "g" },
              { label: "Fat",     value: Math.round(todayFat),     color: "#f97316", unit: "g" },
            ].map((m) => (
              <div key={m.label} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}{m.unit}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera / upload */}
      <ImageSourcePicker
        uploadLabel="📸 Take a photo or upload your meal"
        uploadSublabel="Works with any food — restaurant, home-cooked, snacks"
        icon="🍽️"
        onFile={handleFile}
      />

      {preview && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Meal preview" className="max-h-64 rounded-2xl border border-gray-200 dark:border-gray-700 object-cover shadow-md" />
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium animate-pulse">🔍 Identifying food items and calculating nutrition...</p>
        </div>
      )}

      {error && (error === RATE_LIMIT_ERROR
        ? <RateLimitError onRetry={() => lastFile && handleFile(lastFile)} />
        : <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">❌ {error}</div>
      )}

      {result && (() => {
        const cfg = HEALTH_COLORS[result.health_rating];
        return (
          <div className="mt-8 space-y-4">
            {/* Header */}
            <div className={`p-5 rounded-2xl border ${cfg.bg} border-transparent`}>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{result.meal_name}</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                  {result.health_rating.charAt(0).toUpperCase() + result.health_rating.slice(1)} meal
                </span>
              </div>

              {/* Calorie + Macros */}
              <div className="text-center mb-4">
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white">{result.total_calories}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">calories</div>
              </div>

              <div className="flex justify-around">
                <MacroRing value={result.total_protein} max={50}  color="#3b82f6" label="Protein" unit="g" />
                <MacroRing value={result.total_carbs}   max={300} color="#eab308" label="Carbs"   unit="g" />
                <MacroRing value={result.total_fat}     max={80}  color="#f97316" label="Fat"     unit="g" />
                <MacroRing value={result.total_fiber}   max={30}  color="#22c55e" label="Fiber"   unit="g" />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center italic">{result.health_note}</p>
            </div>

            {/* Item breakdown */}
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Item Breakdown</h3>
              <div className="space-y-2">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({item.portion})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400">{item.protein}g P</span>
                      <span className="text-yellow-600 dark:text-yellow-400">{item.carbs}g C</span>
                      <span className="text-orange-600 dark:text-orange-400">{item.fat}g F</span>
                      <span className="font-bold text-gray-900 dark:text-white w-16 text-right">{item.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Today's meal log */}
      {log.length > 0 && (
        <div className="mt-6 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Today&apos;s Meals ({log.length})</h3>
          <div className="space-y-2">
            {log.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  {entry.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.meal_name}</div>
                    <div className="text-xs text-gray-400">{new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.total_calories} kcal</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
