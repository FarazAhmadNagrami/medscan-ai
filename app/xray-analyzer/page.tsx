"use client";

import { useState, useCallback } from "react";
import ImageSourcePicker from "@/components/ImageSourcePicker";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ShareButtons from "@/components/ShareButtons";
import PrintButton from "@/components/PrintButton";
import { callGeminiWithImage, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import { useLanguage, withLanguage } from "@/lib/language";

interface XRayResult {
  body_part: string;
  overall_impression: string;
  findings: { area: string; observation: string; significance: "normal" | "mild" | "moderate" | "significant" }[];
  possible_conditions: { name: string; likelihood: string }[];
  recommendations: string[];
  urgency: "routine" | "soon" | "urgent";
}

const URGENCY_CONFIG = {
  routine: { label: "Routine Follow-up", color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  soon:    { label: "See Doctor Soon",   color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
  urgent:  { label: "Seek Urgent Care",  color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
};

const SIG_COLOR = {
  normal:      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  mild:        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  moderate:    "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  significant: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export default function XRayAnalyzer() {
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<XRayResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { language }            = useLanguage();

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file); setResult(null); setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      try {
        const prompt = withLanguage(
          `You are a radiologist AI assistant. Analyze this medical image (X-ray, MRI, CT scan, or ultrasound). Return JSON with: body_part (string), overall_impression (string), findings (array of {area, observation, significance: normal|mild|moderate|significant}), possible_conditions (array of {name, likelihood}), recommendations (array of strings), urgency (routine|soon|urgent).`,
          language
        );
        const raw    = await callGeminiWithImage(dataUrl.split(",")[1], file.type, prompt);
        const parsed = parseJSON<XRayResult>(raw);
        if (!parsed) throw new Error("Could not parse result");
        setResult(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [language]);

  const shareText = result
    ? `X-Ray Analysis\n\nBody Part: ${result.body_part}\nImpression: ${result.overall_impression}\nUrgency: ${result.urgency}`
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🫁</span> X-Ray / MRI Analyzer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload an X-ray, MRI, CT scan, or ultrasound image for AI-powered analysis.</p>
      </div>

      <ImageSourcePicker uploadLabel="Drop a medical image here or click to browse" uploadSublabel="X-ray, MRI, CT scan, Ultrasound — JPG, PNG" icon="🫁" onFile={handleFile} />

      {preview && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="X-ray preview" className="max-h-64 rounded-xl border border-gray-200 dark:border-gray-700 object-contain" />
        </div>
      )}

      {loading && <div className="mt-8"><p className="text-sm text-blue-600 font-medium mb-4 animate-pulse">🔬 Analyzing medical image with AI...</p><LoadingSkeleton rows={4} /></div>}

      {error && (error === RATE_LIMIT_ERROR
        ? <RateLimitError onRetry={() => lastFile && handleFile(lastFile)} />
        : <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">❌ {error}</div>
      )}

      {result && (
        <div id="xray-result" className="mt-8 space-y-4">
          {/* Header */}
          <div className={`p-5 rounded-2xl border ${URGENCY_CONFIG[result.urgency].bg}`}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{result.body_part}</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{result.overall_impression}</p>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${URGENCY_CONFIG[result.urgency].bg} ${URGENCY_CONFIG[result.urgency].color}`}>
                {URGENCY_CONFIG[result.urgency].label}
              </span>
            </div>
          </div>

          {/* Findings */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Findings</h3>
            <div className="space-y-3">
              {result.findings.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${SIG_COLOR[f.significance]}`}>{f.significance}</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.area}: </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{f.observation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Possible conditions */}
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Possible Conditions</h3>
            <div className="space-y-2">
              {result.possible_conditions.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-400">{c.name}</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">{c.likelihood}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
            <ul className="space-y-1.5">
              {result.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"><span className="text-blue-500">→</span>{r}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 flex-wrap pt-1">
            <PrintButton contentId="xray-result" title="X-Ray Analysis Report" />
            <ShareButtons title="X-Ray Analysis" text={shareText} />
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}
