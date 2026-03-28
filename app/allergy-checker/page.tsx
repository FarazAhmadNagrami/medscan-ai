"use client";

import { useState, useCallback } from "react";
import ImageSourcePicker from "@/components/ImageSourcePicker";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ShareButtons from "@/components/ShareButtons";
import { callGeminiWithImage, callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import { useLanguage, withLanguage } from "@/lib/language";

interface AllergyResult {
  detected_item: string;
  common_allergens: { name: string; severity: "low" | "moderate" | "high"; symptoms: string[] }[];
  safe_for: string[];
  avoid_if: string[];
  cross_reactions: string[];
  emergency_signs: string[];
}

const SEV = {
  low:      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  moderate: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  high:     "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export default function AllergyChecker() {
  const [preview, setPreview]   = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [mode, setMode]         = useState<"image" | "text">("image");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<AllergyResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { language }            = useLanguage();

  const analyzeImage = useCallback(async (file: File) => {
    setLastFile(file); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const prompt = withLanguage(
          `Analyze this image for potential allergens. It could be food, a plant, an insect, or a skin reaction. Return JSON: detected_item (string), common_allergens (array of {name, severity: low|moderate|high, symptoms: string[]}), safe_for (string array), avoid_if (string array), cross_reactions (string array), emergency_signs (string array).`,
          language
        );
        const raw = await callGeminiWithImage(dataUrl.split(",")[1], file.type, prompt);
        const parsed = parseJSON<AllergyResult>(raw);
        if (!parsed) throw new Error("Could not parse result");
        setResult(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  }, [language]);

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setResult(null); setError(null); setLoading(true);
    try {
      const prompt = withLanguage(
        `Check for allergy information about: "${textInput}". Return JSON: detected_item (string), common_allergens (array of {name, severity: low|moderate|high, symptoms: string[]}), safe_for (string array), avoid_if (string array), cross_reactions (string array), emergency_signs (string array).`,
        language
      );
      const raw = await callGeminiText(prompt);
      const parsed = parseJSON<AllergyResult>(raw);
      if (!parsed) throw new Error("Could not parse result");
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🌿</span> Allergy Checker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload a photo of food, a plant, or describe an ingredient to check for allergens.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["image", "text"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
            {m === "image" ? "📷 Photo" : "✏️ Type Ingredient"}
          </button>
        ))}
      </div>

      {mode === "image" ? (
        <ImageSourcePicker uploadLabel="Drop a photo of food or plant" uploadSublabel="JPG, PNG, WEBP" icon="🌿" onFile={analyzeImage} />
      ) : (
        <div className="flex gap-3">
          <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeText()}
            placeholder="e.g. peanuts, shellfish, latex, bee sting..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <button onClick={analyzeText} disabled={loading || !textInput.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors">
            Check
          </button>
        </div>
      )}

      {preview && mode === "image" && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-h-48 rounded-xl border border-gray-200 dark:border-gray-700 object-contain" />
        </div>
      )}

      {loading && <div className="mt-8"><p className="text-sm text-green-600 font-medium mb-4 animate-pulse">🌿 Checking allergens...</p><LoadingSkeleton rows={3} /></div>}

      {error && (error === RATE_LIMIT_ERROR
        ? <RateLimitError onRetry={() => lastFile && analyzeImage(lastFile)} />
        : <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">❌ {error}</div>
      )}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{result.detected_item}</h2>
          </div>

          {/* Allergens */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Known Allergens</h3>
            {result.common_allergens.map((a, i) => (
              <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{a.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEV[a.severity]}`}>{a.severity} risk</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.symptoms.map((s, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Safe for</h4>
              <ul className="space-y-1">{result.safe_for.map((s, i) => <li key={i} className="text-sm text-green-700 dark:text-green-400">• {s}</li>)}</ul>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ Avoid if allergic to</h4>
              <ul className="space-y-1">{result.avoid_if.map((s, i) => <li key={i} className="text-sm text-red-700 dark:text-red-400">• {s}</li>)}</ul>
            </div>
          </div>

          {result.emergency_signs?.length > 0 && (
            <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-2xl border border-red-300 dark:border-red-700">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">🚨 Emergency Signs — Call ambulance if:</h4>
              <ul className="space-y-1">{result.emergency_signs.map((s, i) => <li key={i} className="text-sm text-red-700 dark:text-red-400 font-medium">• {s}</li>)}</ul>
            </div>
          )}

          <div className="pt-1">
            <ShareButtons title="Allergy Check Results" text={`Allergy Check: ${result.detected_item}\n\nAllergens: ${result.common_allergens.map(a => a.name).join(", ")}`} />
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}
