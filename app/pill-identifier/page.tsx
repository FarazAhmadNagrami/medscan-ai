"use client";

import { useState, useCallback } from "react";
import ImageSourcePicker from "@/components/ImageSourcePicker";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { callGeminiWithImage, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import { fetchRxNormData, type RxNormDrug } from "@/lib/rxnorm";

interface PillResult {
  medicine_name: string;
  dosage: string;
  manufacturer: string;
  common_uses: string[];
  side_effects: string[];
  warnings: string[];
}

interface ScanHistory {
  id: string;
  medicine_name: string;
  dosage: string;
  timestamp: string;
  imageUrl: string;
}

function saveToHistory(result: PillResult, imageUrl: string) {
  const existing: ScanHistory[] = JSON.parse(
    localStorage.getItem("pill_history") ?? "[]"
  );
  const entry: ScanHistory = {
    id: Date.now().toString(),
    medicine_name: result.medicine_name,
    dosage: result.dosage,
    timestamp: new Date().toLocaleString(),
    imageUrl,
  };
  localStorage.setItem(
    "pill_history",
    JSON.stringify([entry, ...existing].slice(0, 10))
  );
}

export default function PillIdentifier() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PillResult | null>(null);
  const [rxData, setRxData] = useState<RxNormDrug | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file);
    setResult(null);
    setRxData(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type;

      setLoading(true);
      try {
        const prompt = `Identify this pill/tablet. Return the medicine name, dosage, manufacturer, common uses, side effects, and warnings in JSON format with keys: medicine_name, dosage, manufacturer, common_uses (array), side_effects (array), warnings (array).`;
        const raw = await callGeminiWithImage(base64, mimeType, prompt);
        const parsed = parseJSON<PillResult>(raw);
        if (!parsed) throw new Error("Could not parse AI response");
        setResult(parsed);
        saveToHistory(parsed, dataUrl);

        const rx = await fetchRxNormData(parsed.medicine_name);
        setRxData(rx);
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
          <span className="text-4xl">💊</span> Pill Identifier
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload a clear photo of any pill or tablet for AI-powered
          identification.
        </p>
      </div>

      <ImageSourcePicker
        uploadLabel="Drop a pill photo here or click to browse"
        uploadSublabel="Supports JPG, PNG, WEBP"
        icon="💊"
        onFile={handleFile}
      />

      {preview && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Pill preview"
            className="max-h-48 rounded-xl border border-gray-200 dark:border-gray-700 object-contain"
          />
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4 animate-pulse">
            🔬 Analyzing pill with Gemini Vision...
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

      {result && (
        <div className="mt-8 space-y-4">
          {/* Main info card */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.medicine_name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                  {result.dosage}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {result.manufacturer}
                </p>
              </div>
              {rxData && (
                <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  ✓ RxNorm Verified — RXCUI: {rxData.rxcui}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Common Uses */}
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Common Uses
              </h3>
              <ul className="space-y-1.5">
                {result.common_uses.map((use, i) => (
                  <li key={i} className="text-sm text-blue-700 dark:text-blue-400 flex gap-2">
                    <span>•</span> {use}
                  </li>
                ))}
              </ul>
            </div>

            {/* Side Effects */}
            <div className="p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                Side Effects
              </h3>
              <ul className="space-y-1.5">
                {result.side_effects.map((effect, i) => (
                  <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400 flex gap-2">
                    <span>•</span> {effect}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3">
                ⚠️ Warnings
              </h3>
              <ul className="space-y-1.5">
                {result.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-400 flex gap-2">
                    <span>•</span> {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RxNorm data */}
          {rxData && (
            <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                FDA / RxNorm Database Entry
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "RXCUI", value: rxData.rxcui },
                  { label: "Official Name", value: rxData.name },
                  { label: "Type", value: rxData.tty ?? "—" },
                  { label: "Synonym", value: rxData.synonym ?? "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-green-600 dark:text-green-500 font-medium uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div className="text-green-800 dark:text-green-300 font-semibold mt-0.5">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
