"use client";

import { useState, useCallback, useRef } from "react";
import Disclaimer from "@/components/Disclaimer";
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

interface ImageItem {
  id: string;
  file: File;
  dataUrl: string;
  result: XRayResult | null;
  loading: boolean;
  error: string | null;
}

const URGENCY_CONFIG = {
  routine: { label: "Routine Follow-up", color: "text-green-600 dark:text-green-400",   bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
  soon:    { label: "See Doctor Soon",   color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
  urgent:  { label: "Seek Urgent Care",  color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
};

const SIG_COLOR = {
  normal:      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  mild:        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  moderate:    "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  significant: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

const MAX_IMAGES = 6;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function XRayAnalyzer() {
  const [images, setImages]       = useState<ImageItem[]>([]);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [dragging, setDragging]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const { language }              = useLanguage();

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    const toAdd = arr.slice(0, remaining);
    if (!toAdd.length) return;

    const newItems: ImageItem[] = await Promise.all(
      toAdd.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        dataUrl: await readFileAsDataUrl(file),
        result: null,
        loading: false,
        error: null,
      }))
    );

    setImages((prev) => {
      const updated = [...prev, ...newItems];
      if (!activeId && updated.length > 0) setActiveId(updated[0].id);
      return updated;
    });
    if (!activeId && newItems.length > 0) setActiveId(newItems[0].id);
  }, [images.length, activeId]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const analyzeOne = useCallback(async (id: string) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, loading: true, error: null } : img));
    const item = images.find((i) => i.id === id);
    if (!item) return;
    try {
      const prompt = withLanguage(
        `You are a radiologist AI assistant. Analyze this medical image (X-ray, MRI, CT scan, or ultrasound). Return JSON only with these fields: body_part (string), overall_impression (string), findings (array of {area, observation, significance: normal|mild|moderate|significant}), possible_conditions (array of {name, likelihood}), recommendations (array of strings), urgency (routine|soon|urgent).`,
        language
      );
      const base64 = item.dataUrl.split(",")[1];
      const raw    = await callGeminiWithImage(base64, item.file.type, prompt);
      const parsed = parseJSON<XRayResult>(raw);
      if (!parsed) throw new Error("Could not parse result");
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, result: parsed, loading: false } : img));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setImages((prev) => prev.map((img) => img.id === id ? { ...img, error: msg, loading: false } : img));
    }
  }, [images, language]);

  const analyzeAll = useCallback(async () => {
    const pending = images.filter((img) => !img.result && !img.loading);
    for (const img of pending) {
      await analyzeOne(img.id);
    }
  }, [images, analyzeOne]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const active = images.find((i) => i.id === activeId) ?? null;
  const allDone = images.length > 0 && images.every((i) => i.result || i.error);
  const anyPending = images.some((i) => !i.result && !i.loading && !i.error);
  const anyLoading = images.some((i) => i.loading);

  const shareText = active?.result
    ? `X-Ray Analysis\n\nBody Part: ${active.result.body_part}\nImpression: ${active.result.overall_impression}\nUrgency: ${active.result.urgency}`
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🫁</span> X-Ray / MRI Analyzer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload up to {MAX_IMAGES} images — X-ray, MRI, CT scan, or ultrasound. AI analyzes each one individually.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors p-8 text-center ${
          dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
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
        <div className="text-5xl mb-3">🫁</div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {images.length === 0
            ? "Drop medical images here or click to browse"
            : images.length >= MAX_IMAGES
            ? `Maximum ${MAX_IMAGES} images reached`
            : `Add more images (${images.length}/${MAX_IMAGES} uploaded)`}
        </p>
        <p className="text-xs text-gray-400 mt-1">X-ray, MRI, CT scan, Ultrasound — JPG, PNG, WEBP</p>
      </div>

      {/* Thumbnail strip */}
      {images.length > 0 && (
        <div className="mt-4 flex gap-3 flex-wrap">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveId(img.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                activeId === img.id
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
              }`}
              style={{ width: 80, height: 80, flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />

              {/* Status overlay */}
              {img.loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {img.result && !img.loading && (
                <div className="absolute bottom-0 inset-x-0 py-0.5 text-center text-xs font-bold bg-green-500 text-white">✓</div>
              )}
              {img.error && !img.loading && (
                <div className="absolute bottom-0 inset-x-0 py-0.5 text-center text-xs font-bold bg-red-500 text-white">!</div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add more button */}
          {images.length < MAX_IMAGES && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors text-xs"
              style={{ flexShrink: 0 }}
            >
              <span className="text-2xl leading-none">+</span>
              <span>Add</span>
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      {images.length > 0 && (
        <div className="mt-4 flex gap-3 flex-wrap items-center">
          {anyPending && (
            <button
              onClick={analyzeAll}
              disabled={anyLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {anyLoading ? "Analyzing…" : images.length === 1 ? "Analyze Image" : `Analyze All ${images.length} Images`}
            </button>
          )}
          {active && !active.result && !active.loading && (
            <button
              onClick={() => analyzeOne(active.id)}
              disabled={anyLoading}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Analyze Selected Only
            </button>
          )}
          {allDone && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ All images analyzed</span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {images.filter((i) => i.result).length}/{images.length} done
          </span>
        </div>
      )}

      {/* Active image large preview + result */}
      {active && (
        <div className="mt-8 space-y-4">
          {/* Image preview */}
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.dataUrl}
              alt="Selected scan"
              className="max-h-72 rounded-xl border border-gray-200 dark:border-gray-700 object-contain mx-auto"
            />
          </div>

          {/* Loading */}
          {active.loading && (
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-blue-600 font-medium animate-pulse">🔬 Analyzing medical image with AI…</p>
            </div>
          )}

          {/* Error */}
          {active.error && (
            active.error === RATE_LIMIT_ERROR
              ? <RateLimitError onRetry={() => analyzeOne(active.id)} />
              : <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
                  ❌ {active.error}
                  <button onClick={() => analyzeOne(active.id)} className="ml-3 underline font-medium">Retry</button>
                </div>
          )}

          {/* Result */}
          {active.result && (
            <div id="xray-result" className="space-y-4">
              {/* Image number badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Image {images.findIndex((i) => i.id === activeId) + 1} of {images.length}
                </span>
                {images.length > 1 && (
                  <span className="text-xs text-blue-500">← Click thumbnails to switch</span>
                )}
              </div>

              {/* Urgency header */}
              <div className={`p-5 rounded-2xl border ${URGENCY_CONFIG[active.result.urgency].bg}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{active.result.body_part}</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{active.result.overall_impression}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full border ${URGENCY_CONFIG[active.result.urgency].bg} ${URGENCY_CONFIG[active.result.urgency].color}`}>
                    {URGENCY_CONFIG[active.result.urgency].label}
                  </span>
                </div>
              </div>

              {/* Findings */}
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Findings</h3>
                <div className="space-y-3">
                  {active.result.findings.map((f, i) => (
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
                  {active.result.possible_conditions.map((c, i) => (
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
                  {active.result.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-blue-500">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 flex-wrap pt-1">
                <PrintButton contentId="xray-result" title="X-Ray Analysis Report" />
                <ShareButtons title="X-Ray Analysis" text={shareText} />
              </div>
            </div>
          )}

          {/* Not yet analyzed */}
          {!active.result && !active.loading && !active.error && (
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-400">
              <p className="text-sm">Click <strong>Analyze All</strong> or <strong>Analyze Selected Only</strong> to see results for this image.</p>
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
