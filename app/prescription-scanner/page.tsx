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

interface PrescribedMed {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  instructions: string;
  warnings: string[];
}

interface PrescriptionResult {
  doctor_name?: string;
  patient_name?: string;
  date?: string;
  diagnosis?: string;
  medications: PrescribedMed[];
  general_instructions: string;
  follow_up?: string;
}

export default function PrescriptionScanner() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const { language } = useLanguage();

  const handleFile = useCallback(async (file: File) => {
    setLastFile(file);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];

      setLoading(true);
      try {
        const prompt = withLanguage(
          `Read this prescription image carefully. Extract all information and return as JSON with: doctor_name, patient_name, date, diagnosis, medications (array of {name, dosage, frequency, duration, purpose, instructions, warnings (array)}), general_instructions, follow_up. If any field is not visible, omit it. Be thorough in explaining each medication's purpose in simple terms.`,
          language
        );
        const raw = await callGeminiWithImage(base64, file.type, prompt);
        const parsed = parseJSON<PrescriptionResult>(raw);
        if (!parsed) throw new Error("Could not read prescription");
        setResult(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [language]);

  const shareText = result
    ? `Prescription — ${result.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}\n\n${result.general_instructions}`
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">📜</span> Prescription Scanner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Upload or photograph a prescription to get plain-English explanations of every medication.
        </p>
      </div>

      <ImageSourcePicker
        uploadLabel="Drop your prescription photo here or click to browse"
        uploadSublabel="Clear photos of handwritten or printed prescriptions"
        icon="📜"
        onFile={handleFile}
      />

      {preview && (
        <div className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Prescription preview" className="max-h-56 rounded-xl border border-gray-200 dark:border-gray-700 object-contain" />
        </div>
      )}

      {loading && (
        <div className="mt-8">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4 animate-pulse">
            📜 Reading prescription with Gemini Vision…
          </p>
          <LoadingSkeleton rows={4} />
        </div>
      )}

      {error && (
        error === RATE_LIMIT_ERROR ? (
          <RateLimitError onRetry={() => lastFile && handleFile(lastFile)} />
        ) : (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
            {lastFile && (
              <button onClick={() => handleFile(lastFile)} className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold">
                🔁 Retry
              </button>
            )}
          </div>
        )
      )}

      {result && (
        <div id="prescription-result" className="mt-8 space-y-4">
          {/* Header info */}
          {(result.doctor_name || result.patient_name || result.date || result.diagnosis) && (
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-3">
                {result.doctor_name && <div><div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Doctor</div><div className="text-sm font-semibold text-blue-900 dark:text-blue-200">{result.doctor_name}</div></div>}
                {result.patient_name && <div><div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Patient</div><div className="text-sm font-semibold text-blue-900 dark:text-blue-200">{result.patient_name}</div></div>}
                {result.date && <div><div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Date</div><div className="text-sm font-semibold text-blue-900 dark:text-blue-200">{result.date}</div></div>}
                {result.diagnosis && <div><div className="text-xs text-blue-500 dark:text-blue-400 font-medium">Diagnosis</div><div className="text-sm font-semibold text-blue-900 dark:text-blue-200">{result.diagnosis}</div></div>}
              </div>
            </div>
          )}

          {/* Medications */}
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            💊 Medications ({result.medications.length})
          </h2>
          {result.medications.map((med, i) => (
            <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{med.name}</h3>
                  <div className="flex gap-2 flex-wrap mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium">{med.dosage}</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium">{med.frequency}</span>
                    {med.duration && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">{med.duration}</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><strong>Purpose:</strong> {med.purpose}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><strong>Instructions:</strong> {med.instructions}</p>
              {med.warnings?.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">⚠️ Warnings</p>
                  <ul className="space-y-1">
                    {med.warnings.map((w, j) => (
                      <li key={j} className="text-xs text-yellow-700 dark:text-yellow-400">• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {result.general_instructions && (
            <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 General Instructions</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.general_instructions}</p>
            </div>
          )}

          {result.follow_up && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">📅 <strong>Follow-up:</strong> {result.follow_up}</p>
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-2">
            <PrintButton contentId="prescription-result" title="Prescription Report" />
            <ShareButtons title="My Prescription" text={shareText} />
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
