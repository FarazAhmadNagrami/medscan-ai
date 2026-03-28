"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { pullFromFirestore, pushToFirestore } from "@/lib/firestoreSync";

const PUSH_INTERVAL_MS = 30_000;

export default function FirestoreSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUidRef  = useRef<string | null>(null);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    if (!user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      lastUidRef.current  = null;
      return;
    }

    if (lastUidRef.current !== user.uid) {
      lastUidRef.current = user.uid;
      pullFromFirestore(user.uid).catch(() => setSyncError(true));
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        pushToFirestore(user.uid).catch(() => setSyncError(true));
      }, PUSH_INTERVAL_MS);
    }

    const handleUnload = () => { pushToFirestore(user.uid); };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  return (
    <>
      {children}
      {syncError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-red-600 text-white text-sm rounded-xl shadow-lg">
          <span>⚠️ Cloud sync failed — your data is saved locally.</span>
          <button
            onClick={() => setSyncError(false)}
            className="ml-2 text-white/70 hover:text-white font-bold text-base leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
