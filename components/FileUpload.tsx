"use client";

import { useCallback, useState } from "react";

interface FileUploadProps {
  accept: string;
  label: string;
  sublabel?: string;
  icon?: string;
  onFile: (file: File) => void;
}

export default function FileUpload({
  accept,
  label,
  sublabel,
  icon = "📎",
  onFile,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <label
      className={`flex flex-col items-center justify-center w-full min-h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <span className="text-4xl mb-3">{fileName ? "✅" : icon}</span>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {fileName ?? label}
      </span>
      {sublabel && !fileName && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {sublabel}
        </span>
      )}
      {fileName && (
        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Click to change file
        </span>
      )}
    </label>
  );
}
