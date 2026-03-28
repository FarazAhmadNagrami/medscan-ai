"use client";

import { useState } from "react";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ShareButtons from "@/components/ShareButtons";
import PrintButton from "@/components/PrintButton";
import { callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import { useLanguage, withLanguage } from "@/lib/language";

interface Interaction {
  drug1: string;
  drug2: string;
  severity: "none" | "mild" | "moderate" | "severe" | "contraindicated";
  description: string;
  mechanism: string;
  recommendation: string;
}

interface InteractionResult {
  interactions: Interaction[];
  overall_risk: string;
  summary: string;
  safe_to_take_together: boolean;
}

const SEVERITY_CONFIG = {
  none: { color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300", label: "No Interaction" },
  mild: { color: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300", label: "Mild" },
  moderate: { color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300", label: "Moderate" },
  severe: { color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300", label: "Severe" },
  contraindicated: { color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700", badge: "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200", label: "⛔ Contraindicated" },
};

export default function DrugInteraction() {
  const [drugs, setDrugs] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const addDrug = () => setDrugs([...drugs, ""]);
  const removeDrug = (i: number) => setDrugs(drugs.filter((_, idx) => idx !== i));
  const updateDrug = (i: number, val: string) => {
    const copy = [...drugs];
    copy[i] = val;
    setDrugs(copy);
  };

  const checkInteractions = async () => {
    const filled = drugs.filter((d) => d.trim());
    if (filled.length < 2) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const prompt = withLanguage(
        `Check drug interactions for the following medications: ${filled.join(", ")}.
Return JSON with: interactions (array of {drug1, drug2, severity (none/mild/moderate/severe/contraindicated), description, mechanism, recommendation}), overall_risk (string), summary (string), safe_to_take_together (boolean).`,
        language
      );
      const raw = await callGeminiText(prompt);
      const parsed = parseJSON<InteractionResult>(raw);
      if (!parsed) throw new Error("Could not parse response");
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const shareText = result
    ? `Drug Interaction Check\n${drugs.filter(Boolean).join(" + ")}\n\nOverall Risk: ${result.overall_risk}\nSafe together: ${result.safe_to_take_together ? "Yes" : "No"}\n\n${result.summary}`
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">⚗️</span> Drug Interaction Checker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Enter 2 or more medications to check for interactions and contraindications.
        </p>
      </div>

      {/* Drug inputs */}
      <div className="space-y-3 mb-4">
        {drugs.map((drug, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={drug}
              onChange={(e) => updateDrug(i, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkInteractions()}
              placeholder={`Medication ${i + 1} (e.g. Aspirin, Metformin)`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {drugs.length > 2 && (
              <button
                onClick={() => removeDrug(i)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={addDrug}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:border-blue-400 transition-colors"
        >
          + Add Medication
        </button>
        <button
          onClick={checkInteractions}
          disabled={loading || drugs.filter(Boolean).length < 2}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          {loading ? "Checking…" : "Check Interactions"}
        </button>
      </div>

      {loading && <LoadingSkeleton rows={3} />}

      {error && (
        error === RATE_LIMIT_ERROR ? (
          <RateLimitError onRetry={checkInteractions} />
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
          </div>
        )
      )}

      {result && (
        <div id="drug-interaction-result" className="space-y-4">
          {/* Summary card */}
          <div className={`p-5 rounded-2xl border ${result.safe_to_take_together ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{result.safe_to_take_together ? "✅" : "⛔"}</span>
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                  {result.safe_to_take_together ? "Generally Safe Together" : "Not Safe to Combine"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Risk: <strong>{result.overall_risk}</strong></p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          {/* Individual interactions */}
          {result.interactions.map((interaction, i) => {
            const cfg = SEVERITY_CONFIG[interaction.severity] ?? SEVERITY_CONFIG.mild;
            return (
              <div key={i} className={`p-5 rounded-2xl border ${cfg.color}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {interaction.drug1} <span className="text-gray-400">+</span> {interaction.drug2}
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{interaction.description}</p>
                {interaction.mechanism && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <strong>Mechanism:</strong> {interaction.mechanism}
                  </p>
                )}
                <div className="p-3 bg-white/60 dark:bg-gray-900/30 rounded-xl">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    💡 {interaction.recommendation}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex gap-3 flex-wrap pt-2">
            <PrintButton contentId="drug-interaction-result" title="Drug Interaction Report" />
            <ShareButtons title="Drug Interaction Check" text={shareText} />
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
