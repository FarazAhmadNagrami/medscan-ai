"use client";

import { useState, useCallback } from "react";
import ImageSourcePicker from "@/components/ImageSourcePicker";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { callGeminiWithImage, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";

interface SkinCondition {
  name: string;
  probability: number;
  description: string;
  recommended_action: string;
  urgency_level: "self_treat" | "see_doctor_soon" | "see_doctor_immediately";
}

function urgencyConfig(level: string) {
  switch (level) {
    case "see_doctor_immediately":
      return {
        color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
        label: "See Doctor Immediately",
        icon: "🚨",
      };
    case "see_doctor_soon":
      return {
        color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
        badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
        label: "See Doctor Soon",
        icon: "⚠️",
      };
    default:
      return {
        color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
        label: "Self Treat",
        icon: "✅",
      };
  }
}

export default function SkinScan() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SkinCondition[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file);
    setResults(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];

      setLoading(true);
      try {
        const prompt = `Analyze this skin condition image. Suggest top 3 possible conditions with probability percentage. For each condition provide: name, probability (number 0-100), description, recommended_action, and urgency_level (one of: self_treat, see_doctor_soon, see_doctor_immediately). Return as JSON array.`;
        const raw = await callGeminiWithImage(base64, file.type, prompt);
        let parsed = parseJSON<SkinCondition[]>(raw);
        if (!parsed) {
          const arrMatch = raw.match(/\[([\s\S]*)\]/);
          if (arrMatch) parsed = JSON.parse(`[${arrMatch[1]}]`);
        }
        if (!parsed || !Array.isArray(parsed)) throw new Error("Could not parse results");
        setResults(parsed);
        localStorage.setItem("skinscan_history", JSON.stringify({
          timestamp: new Date().toLocaleString(),
          top: parsed[0]?.name,
          urgency: parsed[0]?.urgency_level,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🔍</span> SkinScan
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload a photo of a skin condition for AI-powered analysis and urgency assessment.
        </p>
      </div>

      <ImageSourcePicker
        uploadLabel="Drop a skin photo here or click to browse"
        uploadSublabel="Clear, well-lit photos give best results"
        icon="🔍"
        onFile={handleFile}
      />

      {preview && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Skin preview"
            className="max-h-56 rounded-xl border border-gray-200 dark:border-gray-700 object-contain"
          />
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-4 animate-pulse">
            🔬 Analyzing skin condition with Gemini Vision...
          </p>
          <LoadingSkeleton rows={3} />
        </div>
      )}

      {error && (
        error === RATE_LIMIT_ERROR ? (
          <RateLimitError onRetry={() => lastFile && handleFile(lastFile)} />
        ) : (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm space-y-3">
            <p>❌ {error}</p>
            {lastFile && (
              <button
                onClick={() => handleFile(lastFile)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                🔁 Retry
              </button>
            )}
          </div>
        )
      )}

      {results && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top {results.length} Possible Conditions
          </h2>
          {results.map((condition, i) => {
            const cfg = urgencyConfig(condition.urgency_level);
            return (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${cfg.color}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-sm shadow-sm">
                      #{i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {condition.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${condition.probability}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {condition.probability}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {condition.description}
                </p>
                <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/30 rounded-xl">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Recommended Action
                  </span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                    {condition.recommended_action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
