"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";

interface ScanEntry {
  id: string;
  type: "pill" | "skin" | "symptom" | "lab" | "diet";
  title: string;
  subtitle?: string;
  timestamp: string;
  imageUrl?: string;
  urgency?: string;
}

const TYPE_CONFIG = {
  pill: { icon: "💊", label: "Pill Identified", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", href: "/pill-identifier" },
  skin: { icon: "🔍", label: "Skin Scan", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300", href: "/skin-scan" },
  symptom: { icon: "💬", label: "Symptom Analysis", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", href: "/symptom-mapper" },
  lab: { icon: "🧪", label: "Lab Report", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300", href: "/lab-report" },
  diet: { icon: "🥗", label: "Diet Plan", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300", href: "/diet-advisor" },
};

function loadAllHistory(): ScanEntry[] {
  const entries: ScanEntry[] = [];

  try {
    const pills: { id: string; medicine_name: string; dosage: string; timestamp: string; imageUrl: string }[] =
      JSON.parse(localStorage.getItem("pill_history") ?? "[]");
    pills.forEach((p) =>
      entries.push({ id: p.id, type: "pill", title: p.medicine_name, subtitle: p.dosage, timestamp: p.timestamp, imageUrl: p.imageUrl })
    );
  } catch {}

  try {
    const skin = JSON.parse(localStorage.getItem("skinscan_history") ?? "null");
    if (skin) entries.push({ id: "skin-" + skin.timestamp, type: "skin", title: skin.top ?? "Skin Condition", subtitle: skin.urgency?.replace(/_/g, " "), timestamp: skin.timestamp });
  } catch {}

  try {
    const symptoms: { timestamp: string; symptoms: string; top_condition: string; urgency: string }[] =
      JSON.parse(localStorage.getItem("symptom_history") ?? "[]");
    symptoms.forEach((s, i) =>
      entries.push({ id: "sym-" + i, type: "symptom", title: s.top_condition ?? "Symptom Analysis", subtitle: s.symptoms?.slice(0, 60) + "…", timestamp: s.timestamp, urgency: s.urgency })
    );
  } catch {}

  try {
    const lab = JSON.parse(localStorage.getItem("lab_history") ?? "null");
    if (lab) entries.push({ id: "lab-" + lab.timestamp, type: "lab", title: `Lab Report — ${lab.count} parameters`, subtitle: `${lab.abnormal} flagged`, timestamp: lab.timestamp });
  } catch {}

  try {
    const diet = JSON.parse(localStorage.getItem("diet_history") ?? "null");
    if (diet) entries.push({ id: "diet-" + diet.timestamp, type: "diet", title: "Diet Plan Generated", subtitle: diet.metrics?.slice(0, 60), timestamp: diet.timestamp });
  } catch {}

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    setEntries(loadAllHistory());
  }, []);

  const clearHistory = () => {
    ["pill_history", "skinscan_history", "symptom_history", "lab_history", "diet_history"].forEach(
      (k) => localStorage.removeItem(k)
    );
    setEntries([]);
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📋</span> Scan History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All your past scans stored locally on this device.</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { key: "all", label: "All" },
          { key: "pill", label: "💊 Pills" },
          { key: "skin", label: "🔍 Skin" },
          { key: "symptom", label: "💬 Symptoms" },
          { key: "lab", label: "🧪 Lab" },
          { key: "diet", label: "🥗 Diet" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-medium">No scans yet</p>
          <p className="text-sm mt-1">Start using the modules and your history will appear here.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const cfg = TYPE_CONFIG[entry.type];
            return (
              <Link href={cfg.href} key={entry.id}>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                  {entry.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                      {cfg.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {entry.urgency && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {entry.urgency.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{entry.title}</p>
                    {entry.subtitle && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{entry.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                    {entry.timestamp}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
