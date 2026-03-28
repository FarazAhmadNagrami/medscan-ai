"use client";

import { useState, useEffect } from "react";

interface Reminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  notes: string;
  enabled: boolean;
}

export default function MedicationReminder() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState({ name: "", dosage: "", time: "08:00", frequency: "daily", notes: "" });
  const [notifStatus, setNotifStatus] = useState<"unknown" | "granted" | "denied">("unknown");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("medication_reminders") ?? "[]");
    setReminders(stored);
    if ("Notification" in window) {
      setNotifStatus(Notification.permission as "granted" | "denied" | "unknown");
    }
  }, []);

  const save = (updated: Reminder[]) => {
    setReminders(updated);
    localStorage.setItem("medication_reminders", JSON.stringify(updated));
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm as "granted" | "denied");
  };

  const addReminder = () => {
    if (!form.name || !form.time) return;
    const newReminder: Reminder = { ...form, id: Date.now().toString(), enabled: true };
    save([...reminders, newReminder]);
    setForm({ name: "", dosage: "", time: "08:00", frequency: "daily", notes: "" });

    if (notifStatus === "granted") {
      new Notification(`💊 Medication Reminder Set`, {
        body: `You will be reminded to take ${form.name} at ${form.time}`,
        icon: "/icon.svg",
      });
    }
  };

  const toggle = (id: string) => {
    save(reminders.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const remove = (id: string) => {
    save(reminders.filter((r) => r.id !== id));
  };

  const testNotification = (r: Reminder) => {
    if (notifStatus === "granted") {
      new Notification(`💊 Time to take ${r.name}`, {
        body: `${r.dosage} — ${r.notes || "Take as prescribed"}`,
        icon: "/icon.svg",
      });
    }
  };

  const freqLabel: Record<string, string> = {
    daily: "Every day", twice: "Twice daily", weekly: "Weekly", "as-needed": "As needed",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">⏰</span> Medication Reminders
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Set up push notification reminders for your medications.</p>
      </div>

      {/* Notification permission */}
      {notifStatus !== "granted" && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {notifStatus === "denied"
              ? "⚠️ Notifications blocked. Enable them in your browser settings to receive reminders."
              : "🔔 Enable notifications to receive medication reminders."}
          </p>
          {notifStatus !== "denied" && (
            <button onClick={requestNotifications}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium whitespace-nowrap transition-colors">
              Enable
            </button>
          )}
        </div>
      )}

      {notifStatus === "granted" && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-sm text-green-700 dark:text-green-300">
          ✅ Notifications enabled — you&apos;ll receive reminders.
        </div>
      )}

      {/* Add reminder form */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">➕ Add Medication</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Medication Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Metformin"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Dosage</label>
            <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Time *</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Frequency</label>
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="daily">Every day</option>
              <option value="twice">Twice daily</option>
              <option value="weekly">Weekly</option>
              <option value="as-needed">As needed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Notes (optional)</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Take with food"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button onClick={addReminder} disabled={!form.name || !form.time}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors">
          Add Reminder
        </button>
      </div>

      {/* Reminder list */}
      {reminders.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-600">
          <div className="text-5xl mb-3">💊</div>
          <p className="text-lg font-medium">No reminders yet</p>
          <p className="text-sm mt-1">Add your first medication above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">{reminders.length} Medication{reminders.length > 1 ? "s" : ""}</h2>
          {reminders.map((r) => (
            <div key={r.id} className={`p-4 bg-white dark:bg-gray-800 rounded-2xl border transition-colors ${r.enabled ? "border-gray-200 dark:border-gray-700" : "border-gray-100 dark:border-gray-800 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">💊 {r.name}</span>
                    {r.dosage && <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{r.dosage}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>🕐 {r.time}</span>
                    <span>📅 {freqLabel[r.frequency] ?? r.frequency}</span>
                  </div>
                  {r.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notifStatus === "granted" && (
                    <button onClick={() => testNotification(r)} title="Test notification"
                      className="p-1.5 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">🔔</button>
                  )}
                  <button onClick={() => toggle(r.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${r.enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${r.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <button onClick={() => remove(r.id)} className="p-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
