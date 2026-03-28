"use client";

import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";

function calcBMI(weight: number, heightCm: number) {
  const h = heightCm / 100;
  return +(weight / (h * h)).toFixed(1);
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6",  bg: "bg-blue-50 dark:bg-blue-900/20",  advice: "Consider increasing caloric intake with nutrient-dense foods." };
  if (bmi < 25)   return { label: "Normal",       color: "#22c55e",  bg: "bg-green-50 dark:bg-green-900/20", advice: "Great! Maintain your current diet and exercise routine." };
  if (bmi < 30)   return { label: "Overweight",   color: "#f97316",  bg: "bg-orange-50 dark:bg-orange-900/20", advice: "Consider moderate exercise and a balanced diet." };
  return           { label: "Obese",            color: "#ef4444",  bg: "bg-red-50 dark:bg-red-900/20",     advice: "Consult a healthcare provider for a personalized plan." };
}

function healthScore(bmi: number, age: number, activityLevel: string): number {
  let score = 100;
  // BMI penalty
  if (bmi < 18.5 || bmi >= 30) score -= 30;
  else if (bmi >= 25) score -= 15;
  // Age adjustment
  if (age > 60) score -= 10;
  else if (age > 40) score -= 5;
  // Activity bonus
  if (activityLevel === "active")       score += 10;
  else if (activityLevel === "moderate") score += 5;
  else score -= 10;
  return Math.max(10, Math.min(100, score));
}

export default function BMICalculator() {
  const [weight, setWeight]   = useState("");
  const [height, setHeight]   = useState("");
  const [age, setAge]         = useState("");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult]   = useState<{ bmi: number; score: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age) || 30;
    if (!w || !h) return;
    const bmi   = calcBMI(w, h);
    const score = healthScore(bmi, a, activity);
    setResult({ bmi, score });
  };

  const cat = result ? bmiCategory(result.bmi) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">📏</span> BMI &amp; Health Score
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Calculate your Body Mass Index and overall health score.</p>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="30"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="sedentary">Sedentary</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
        <button onClick={calculate}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
          Calculate
        </button>
      </div>

      {result && cat && (
        <div className="space-y-4">
          {/* BMI result */}
          <div className={`p-6 rounded-2xl border ${cat.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-5xl font-extrabold" style={{ color: cat.color }}>{result.bmi}</div>
                <div className="text-lg font-bold mt-1" style={{ color: cat.color }}>{cat.label}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Health Score</div>
                <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{result.score}<span className="text-lg font-normal text-gray-400">/100</span></div>
              </div>
            </div>
            {/* Score bar */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${result.score}%`, backgroundColor: cat.color }} />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{cat.advice}</p>
          </div>

          {/* BMI scale */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">BMI Scale</h3>
            <div className="space-y-2">
              {[
                { range: "< 18.5",    label: "Underweight", color: "#3b82f6" },
                { range: "18.5–24.9", label: "Normal",       color: "#22c55e" },
                { range: "25–29.9",   label: "Overweight",   color: "#f97316" },
                { range: "≥ 30",      label: "Obese",        color: "#ef4444" },
              ].map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-20">{r.range}</span>
                  <span className="text-sm font-medium" style={{ color: r.color }}>{r.label}</span>
                  {r.label === cat.label && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">← You</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
