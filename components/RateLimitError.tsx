"use client";

import { useEffect, useState } from "react";

interface RateLimitErrorProps {
  onRetry: () => void;
  waitSeconds?: number;
}

export default function RateLimitError({ onRetry, waitSeconds = 30 }: RateLimitErrorProps) {
  const [seconds, setSeconds] = useState(waitSeconds);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSeconds(waitSeconds);
    setReady(false);
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setReady(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waitSeconds]);

  const pct = ((waitSeconds - seconds) / waitSeconds) * 100;

  return (
    <div className="mt-6 p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⏱️</span>
        <div>
          <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
            Rate limit reached
          </p>
          <p className="text-orange-700 dark:text-orange-400 text-xs mt-0.5">
            No auto-retries are fired — your quota is safe.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {!ready && (
        <div>
          <div className="w-full h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5">
            Ready to retry in <span className="font-bold">{seconds}s</span>…
          </p>
        </div>
      )}

      <button
        onClick={onRetry}
        disabled={!ready}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
      >
        {ready ? "🔁 Retry Now" : `⏳ Wait ${seconds}s…`}
      </button>
    </div>
  );
}
