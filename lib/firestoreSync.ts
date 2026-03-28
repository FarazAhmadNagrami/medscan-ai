import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// All localStorage keys to sync to Firestore
export const SYNC_KEYS = [
  "vitals_history_v2",
  "food_log",
  "water_log",
  "water_goal",
  "water_log_date",
  "exercise_log",
  "medication_reminders",
  "health_goals",
  "medical_card",
  "scan_history",
];

/** Pull user data from Firestore into localStorage */
export async function pullFromFirestore(uid: string): Promise<void> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return;
  const data = snap.data();
  for (const key of SYNC_KEYS) {
    if (data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }
}

/** Push localStorage data to Firestore */
export async function pushToFirestore(uid: string): Promise<void> {
  const payload: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        payload[key] = JSON.parse(raw);
      } catch {
        payload[key] = raw;
      }
    }
  }
  if (Object.keys(payload).length === 0) return;
  await setDoc(doc(db, "users", uid), payload, { merge: true });
}
