"use client";

import { useState, lazy, Suspense } from "react";
import FileUpload from "./FileUpload";

const CameraCapture = lazy(() => import("./CameraCapture"));

interface ImageSourcePickerProps {
  onFile: (file: File) => void;
  uploadLabel?: string;
  uploadSublabel?: string;
  icon?: string;
}

export default function ImageSourcePicker({
  onFile,
  uploadLabel = "Drop an image here or click to browse",
  uploadSublabel = "Supports JPG, PNG, WEBP",
  icon = "📎",
}: ImageSourcePickerProps) {
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "upload"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"
          }`}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => setMode("camera")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            mode === "camera"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"
          }`}
        >
          📷 Take Photo
        </button>
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <FileUpload
          accept="image/*"
          label={uploadLabel}
          sublabel={uploadSublabel}
          icon={icon}
          onFile={onFile}
        />
      )}

      {/* Camera mode */}
      {mode === "camera" && (
        <button
          onClick={() => setCameraOpen(true)}
          className="flex flex-col items-center justify-center w-full min-h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer"
        >
          <span className="text-4xl mb-3">📷</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Open Camera
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use your device camera to take a photo
          </span>
        </button>
      )}

      {/* Camera modal */}
      {cameraOpen && (
        <Suspense fallback={null}>
          <CameraCapture
            onCapture={(file) => {
              onFile(file);
              setCameraOpen(false);
            }}
            onClose={() => setCameraOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
