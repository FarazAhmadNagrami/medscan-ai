"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";

interface HealthMetrics {
  bloodSugar: string;
  cholesterol: string;
  bloodPressure: string;
  bmi: string;
  age: string;
  notes: string;
}

interface Meal {
  name: string;
  time: string;
  foods: string[];
  portions: string;
  notes: string;
}

interface DayPlan {
  day: string;
  meals: Meal[];
  focus_nutrients: string[];
}

interface DietPlan {
  foods_to_eat: string[];
  foods_to_avoid: string[];
  weekly_plan: DayPlan[];
  general_advice: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DietAdvisor() {
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [metrics, setMetrics] = useState<HealthMetrics>({
    bloodSugar: "",
    cholesterol: "",
    bloodPressure: "",
    bmi: "",
    age: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const generatePlan = async (metricsText: string) => {
    setLoading(true);
    setPlan(null);
    setError(null);
    try {
      const prompt = `Based on these health metrics, generate a personalized 7-day diet plan. Include foods to eat, foods to avoid, meal timing, portion sizes, and specific nutrients to focus on. Cross reference with the user's health numbers and explain why each recommendation is made. Return as structured JSON with: foods_to_eat (array), foods_to_avoid (array), weekly_plan (array of 7 days, each with: day, meals (array of {name, time, foods, portions, notes}), focus_nutrients (array)), general_advice (string).\n\nHealth metrics:\n${metricsText}`;
      const raw = await callGeminiText(prompt);
      const parsed = parseJSON<DietPlan>(raw);
      if (!parsed) throw new Error("Could not parse diet plan");
      setPlan(parsed);
      localStorage.setItem("diet_history", JSON.stringify({
        timestamp: new Date().toLocaleString(),
        metrics: metricsText.slice(0, 200),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = Object.entries(metrics)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    generatePlan(text);
  };

  const handleFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
    }
    generatePlan(text);
  };

  const dayPlan = plan?.weekly_plan?.[selectedDay];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🥗</span> Diet Advisor
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Get a personalized 7-day diet plan based on your health metrics.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["manual", "upload"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === m
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-teal-400"
            }`}
          >
            {m === "manual" ? "📝 Enter Manually" : "📄 Upload Report"}
          </button>
        ))}
      </div>

      {mode === "manual" ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "bloodSugar", label: "Blood Sugar (mg/dL)", placeholder: "e.g. 120" },
              { key: "cholesterol", label: "Cholesterol (mg/dL)", placeholder: "e.g. 200" },
              { key: "bloodPressure", label: "Blood Pressure (mmHg)", placeholder: "e.g. 120/80" },
              { key: "bmi", label: "BMI", placeholder: "e.g. 24.5" },
              { key: "age", label: "Age", placeholder: "e.g. 35" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={metrics[key as keyof HealthMetrics]}
                  onChange={(e) => setMetrics({ ...metrics, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Notes / Medical Conditions
            </label>
            <textarea
              placeholder="e.g. Type 2 diabetic, vegetarian, lactose intolerant..."
              value={metrics.notes}
              onChange={(e) => setMetrics({ ...metrics, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? "Generating plan..." : "Generate My 7-Day Diet Plan"}
          </button>
        </form>
      ) : (
        <FileUpload
          accept=".pdf"
          label="Drop your medical report PDF here or click to browse"
          sublabel="Lab reports, health checkups, etc."
          icon="📄"
          onFile={handleFile}
        />
      )}

      {loading && (
        <div className="mt-8">
          <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-4 animate-pulse">
            🥗 Crafting your personalized 7-day diet plan...
          </p>
          <LoadingSkeleton rows={4} />
        </div>
      )}

      {error && (
        error === RATE_LIMIT_ERROR ? (
          <RateLimitError onRetry={handleManualSubmit as () => void} />
        ) : (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
          </div>
        )
      )}

      {plan && (
        <div className="mt-10 space-y-6">
          {/* Eat / Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                ✅ Foods to Eat
              </h3>
              <ul className="space-y-1.5">
                {plan.foods_to_eat.map((food, i) => (
                  <li key={i} className="text-sm text-green-700 dark:text-green-400 flex gap-2">
                    <span>•</span> {food}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">
                ❌ Foods to Avoid
              </h3>
              <ul className="space-y-1.5">
                {plan.foods_to_avoid.map((food, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex gap-2">
                    <span>•</span> {food}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* General advice */}
          {plan.general_advice && (
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                💡 General Advice
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">{plan.general_advice}</p>
            </div>
          )}

          {/* Weekly calendar */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">
              📅 Weekly Meal Plan
            </h3>

            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(plan.weekly_plan ?? []).map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDay === i
                      ? "bg-teal-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-teal-400"
                  }`}
                >
                  {day.day ?? DAYS[i]}
                </button>
              ))}
            </div>

            {/* Day content */}
            {dayPlan && (
              <div className="mt-4 space-y-3">
                {dayPlan.focus_nutrients?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium self-center">
                      Focus nutrients:
                    </span>
                    {dayPlan.focus_nutrients.map((n, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}

                {dayPlan.meals?.map((meal, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {meal.name}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {meal.time}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {meal.foods?.map((food, j) => (
                        <li key={j} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                          <span className="text-teal-500">→</span> {food}
                        </li>
                      ))}
                    </ul>
                    {meal.portions && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        📏 {meal.portions}
                      </p>
                    )}
                    {meal.notes && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        💡 {meal.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
