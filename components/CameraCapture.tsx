"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    // Stop any existing stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setSnapshot(null);
    setError(null);
    setStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setStarting(false);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions and try again.");
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [facingMode, startCamera]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSnapshot(dataUrl);

    // Stop camera stream after capture
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const retake = () => {
    setSnapshot(null);
    startCamera(facingMode);
  };

  const confirm = () => {
    if (!snapshot) return;
    const byteString = atob(snapshot.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file);
    onClose();
  };

  const flipCamera = () =>
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📷</span> Camera
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Camera / Snapshot view */}
        <div className="relative bg-black aspect-video">
          {!snapshot && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          {snapshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snapshot} alt="Snapshot" className="w-full h-full object-contain" />
          )}

          {/* Overlays */}
          {starting && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting camera…
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <div className="text-4xl mb-3">🚫</div>
                <p className="text-white text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Flip button (only while previewing) */}
          {!snapshot && !error && !starting && (
            <button
              onClick={flipCamera}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              title="Flip camera"
            >
              🔄
            </button>
          )}

          {/* Viewfinder corners */}
          {!snapshot && !error && !starting && (
            <div className="absolute inset-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/70 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/70 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/70 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/70 rounded-br" />
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="px-5 py-4 flex gap-3 justify-center">
          {!snapshot ? (
            <button
              onClick={capture}
              disabled={!!error || starting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl font-medium transition-colors"
            >
              📸 Capture Photo
            </button>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                🔁 Retake
              </button>
              <button
                onClick={confirm}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
              >
                ✅ Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
