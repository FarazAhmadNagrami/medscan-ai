"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import PrintButton from "@/components/PrintButton";

interface LabParameter {
  parameter: string;
  value: string;
  unit: string;
  status: "LOW" | "NORMAL" | "HIGH";
  severity: "mild" | "moderate" | "severe" | "none";
  explanation: string;
}

function statusColor(status: string, severity: string) {
  if (status === "NORMAL") return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300";
  if (severity === "mild") return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300";
  if (severity === "moderate") return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300";
  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300";
}

function badgeColor(status: string, severity: string) {
  if (status === "NORMAL") return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
  if (severity === "mild") return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300";
  if (severity === "moderate") return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
}

async function extractTextFromPDF(file: File): Promise<string> {
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
  return text;
}

export default function LabReport() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LabParameter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file);
    setResults(null);
    setError(null);
    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      const prompt = `You are a medical report analyzer. Explain each value in this lab report in simple plain English. Flag any abnormal values as LOW, NORMAL, or HIGH with a severity level of mild, moderate, or severe (use "none" for normal). Return as JSON array with fields: parameter, value, unit, status, severity, explanation.\n\nLab report:\n${text}`;
      const raw = await callGeminiText(prompt);
      let parsed = parseJSON<LabParameter[]>(raw);
      if (!parsed) {
        const arrMatch = raw.match(/\[([\s\S]*)\]/);
        if (arrMatch) parsed = JSON.parse(`[${arrMatch[1]}]`);
      }
      if (!parsed || !Array.isArray(parsed)) throw new Error("Could not parse lab results");

      setResults(parsed);
      localStorage.setItem(
        "lab_history",
        JSON.stringify({
          timestamp: new Date().toLocaleString(),
          count: parsed.length,
          abnormal: parsed.filter((p) => p.status !== "NORMAL").length,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const abnormal = results?.filter((r) => r.status !== "NORMAL") ?? [];
  const normal = results?.filter((r) => r.status === "NORMAL") ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🧪</span> Lab Report AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload a blood test or lab report PDF for plain-English analysis.
        </p>
      </div>

      <FileUpload
        accept=".pdf"
        label="Drop your lab report PDF here or click to browse"
        sublabel="PDF files only"
        icon="📄"
        onFile={handleFile}
      />

      {loading && (
        <div className="mt-8">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-4 animate-pulse">
            🔬 Extracting and analyzing your lab report...
          </p>
          <LoadingSkeleton rows={5} />
        </div>
      )}

      {error && (
        error === RATE_LIMIT_ERROR ? (
          <RateLimitError onRetry={() => lastFile && handleFile(lastFile)} />
        ) : (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
          </div>
        )
      )}

      {results && (
        <div id="lab-result" className="mt-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Total Parameters", value: results.length, color: "blue" },
              { label: "Normal", value: normal.length, color: "green" },
              { label: "Flagged", value: abnormal.length, color: "red" },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className={`text-3xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Abnormal first */}
          {abnormal.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
                ⚠️ Flagged Values ({abnormal.length})
              </h3>
              <div className="space-y-3">
                {abnormal.map((param, i) => (
                  <LabRow key={i} param={param} />
                ))}
              </div>
            </div>
          )}

          {/* Normal values */}
          {normal.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">
                ✅ Normal Values ({normal.length})
              </h3>
              <div className="space-y-3">
                {normal.map((param, i) => (
                  <LabRow key={i} param={param} />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-2">
            <PrintButton contentId="lab-result" title="Lab Report Analysis" />
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}

function LabRow({ param }: { param: LabParameter }) {
  return (
    <div
      className={`p-4 rounded-xl border ${statusColor(param.status, param.severity)}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{param.parameter}</span>
          <span className="font-bold">
            {param.value} {param.unit}
          </span>
        </div>
        <div className="flex gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor(param.status, param.severity)}`}
          >
            {param.status}
          </span>
          {param.severity && param.severity !== "none" && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor(param.status, param.severity)}`}
            >
              {param.severity}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm opacity-90">{param.explanation}</p>
    </div>
  );
}
