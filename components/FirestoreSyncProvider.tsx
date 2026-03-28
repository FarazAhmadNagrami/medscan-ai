"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { pullFromFirestore, pushToFirestore } from "@/lib/firestoreSync";

const PUSH_INTERVAL_MS = 30_000; // push every 30 seconds

export default function FirestoreSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUidRef  = useRef<string | null>(null);

  useEffect(() => {
    // Clear interval when user logs out
    if (!user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      lastUidRef.current  = null;
      return;
    }

    // Pull from Firestore once on login (new session or user switch)
    if (lastUidRef.current !== user.uid) {
      lastUidRef.current = user.uid;
      pullFromFirestore(user.uid).catch(() => {});
    }

    // Push every 30 seconds
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        pushToFirestore(user.uid).catch(() => {});
      }, PUSH_INTERVAL_MS);
    }

    // Push when user closes or navigates away
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

  return <>{children}</>;
}
