"use client";

import { useState, useCallback, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import Disclaimer from "@/components/Disclaimer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { callGeminiText, callGeminiWithImages, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
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

const MAX_IMAGES = 6;

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

const LAB_PROMPT = `You are a medical report analyzer. Explain each value in this lab report in simple plain English. Flag any abnormal values as LOW, NORMAL, or HIGH with a severity level of mild, moderate, or severe (use "none" for normal). Return as JSON array with fields: parameter, value, unit, status, severity, explanation.`;

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

function parseResults(raw: string): LabParameter[] | null {
  let parsed = parseJSON<LabParameter[]>(raw);
  if (!parsed) {
    const arrMatch = raw.match(/\[([\s\S]*)\]/);
    if (arrMatch) {
      try { parsed = JSON.parse(`[${arrMatch[1]}]`); } catch { return null; }
    }
  }
  return Array.isArray(parsed) ? parsed : null;
}

interface ImageEntry {
  id: string;
  file: File;
  dataUrl: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LabReport() {
  const [mode, setMode] = useState<"pdf" | "images">("pdf");

  // PDF state
  const [lastFile, setLastFile] = useState<File | null>(null);

  // Image state
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LabParameter[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveHistory = (parsed: LabParameter[]) => {
    localStorage.setItem("lab_history", JSON.stringify({
      timestamp: new Date().toLocaleString(),
      count: parsed.length,
      abnormal: parsed.filter((p) => p.status !== "NORMAL").length,
    }));
  };

  // ── PDF handler ──────────────────────────────────────────────
  const handlePDF = useCallback(async (file: File) => {
    setLastFile(file);
    setResults(null);
    setError(null);
    setLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      const raw = await callGeminiText(`${LAB_PROMPT}\n\nLab report:\n${text}`);
      const parsed = parseResults(raw);
      if (!parsed) throw new Error("Could not parse lab results");
      setResults(parsed);
      saveHistory(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Image handlers ───────────────────────────────────────────
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    const toAdd = arr.slice(0, remaining);
    if (!toAdd.length) return;
    const newEntries: ImageEntry[] = await Promise.all(
      toAdd.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        dataUrl: await readFileAsDataUrl(file),
      }))
    );
    setImages((prev) => [...prev, ...newEntries]);
    setResults(null);
    setError(null);
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResults(null);
  };

  const analyzeImages = useCallback(async () => {
    if (!images.length) return;
    setResults(null);
    setError(null);
    setLoading(true);
    try {
      const payload = images.map((img) => ({
        base64: img.dataUrl.split(",")[1],
        mimeType: img.file.type,
      }));
      const prompt = `${LAB_PROMPT}\n\nThe images provided are pages of the same lab report. Analyze all pages together as one report.`;
      const raw = await callGeminiWithImages(payload, prompt);
      const parsed = parseResults(raw);
      if (!parsed) throw new Error("Could not parse lab results");
      setResults(parsed);
      saveHistory(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [images]);

  const abnormal = results?.filter((r) => r.status !== "NORMAL") ?? [];
  const normal   = results?.filter((r) => r.status === "NORMAL")  ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🧪</span> Lab Report AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload a lab report PDF or photos — AI explains every value in plain English.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(["pdf", "images"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setResults(null); setError(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === m
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-400"
            }`}
          >
            {m === "pdf" ? "📄 PDF" : "📷 Images"}
          </button>
        ))}
      </div>

      {/* PDF mode */}
      {mode === "pdf" && (
        <FileUpload
          accept=".pdf"
          label="Drop your lab report PDF here or click to browse"
          sublabel="PDF files only"
          icon="📄"
          onFile={handlePDF}
        />
      )}

      {/* Image mode */}
      {mode === "images" && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors p-8 text-center ${
              dragging
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            } ${images.length >= MAX_IMAGES ? "opacity-40 pointer-events-none" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <div className="text-5xl mb-3">📷</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {images.length === 0
                ? "Drop lab report photos here or click to browse"
                : images.length >= MAX_IMAGES
                ? `Maximum ${MAX_IMAGES} images reached`
                : `Add more pages (${images.length}/${MAX_IMAGES} uploaded)`}
            </p>
            <p className="text-xs text-gray-400 mt-1">Up to {MAX_IMAGES} pages — JPG, PNG, WEBP</p>
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="mt-4 flex gap-3 flex-wrap">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
                  style={{ width: 80, height: 80, flexShrink: 0 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 py-0.5 text-center text-[10px] font-bold bg-black/50 text-white">
                    p.{idx + 1}
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors text-xs"
                  style={{ flexShrink: 0 }}
                >
                  <span className="text-2xl leading-none">+</span>
                  <span>Add</span>
                </button>
              )}
            </div>
          )}

          {images.length > 0 && !loading && (
            <button
              onClick={analyzeImages}
              className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              Analyze {images.length} {images.length === 1 ? "Image" : "Images"} Together
            </button>
          )}
        </>
      )}

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
          <RateLimitError onRetry={mode === "pdf" ? () => lastFile && handlePDF(lastFile) : analyzeImages} />
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
              { label: "Total Parameters", value: results.length,  color: "blue"  },
              { label: "Normal",           value: normal.length,   color: "green" },
              { label: "Flagged",          value: abnormal.length, color: "red"   },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className={`text-3xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {abnormal.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">⚠️ Flagged Values ({abnormal.length})</h3>
              <div className="space-y-3">
                {abnormal.map((param, i) => <LabRow key={i} param={param} />)}
              </div>
            </div>
          )}

          {normal.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">✅ Normal Values ({normal.length})</h3>
              <div className="space-y-3">
                {normal.map((param, i) => <LabRow key={i} param={param} />)}
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
    <div className={`p-4 rounded-xl border ${statusColor(param.status, param.severity)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{param.parameter}</span>
          <span className="font-bold">{param.value} {param.unit}</span>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor(param.status, param.severity)}`}>
            {param.status}
          </span>
          {param.severity && param.severity !== "none" && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor(param.status, param.severity)}`}>
              {param.severity}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm opacity-90">{param.explanation}</p>
    </div>
  );
}
