"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface Stat { label: string; value: string | number; sub: string; color: string; href: string; icon: string }

export default function HealthDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [vitalsLatest, setVitalsLatest] = useState<Record<string, number> | null>(null);
  const [reminders, setReminders] = useState<{ name: string; time: string }[]>([]);

  useEffect(() => {
    const pillHistory    = JSON.parse(localStorage.getItem("pill_history") ?? "[]");
    const labHistory     = localStorage.getItem("lab_history");
    const skinHistory    = localStorage.getItem("skinscan_history");
    const symptomHistory = JSON.parse(localStorage.getItem("symptom_history") ?? "[]");
    const vitalsHistory  = JSON.parse(localStorage.getItem("vitals_history_v2") ?? "[]");
    const meds           = JSON.parse(localStorage.getItem("medication_reminders") ?? "[]");

    if (vitalsHistory.length > 0) setVitalsLatest(vitalsHistory[vitalsHistory.length - 1]);
    setReminders(meds.slice(0, 3));

    setStats([
      { label: "Pills Identified",   value: pillHistory.length,           sub: "lifetime scans",       color: "#3b82f6", href: "/pill-identifier",   icon: "💊" },
      { label: "Lab Reports",        value: labHistory ? 1 : 0,           sub: "analyzed",             color: "#8b5cf6", href: "/lab-report",         icon: "🧪" },
      { label: "Skin Scans",         value: skinHistory ? 1 : 0,          sub: "analyzed",             color: "#f97316", href: "/skin-scan",          icon: "🔍" },
      { label: "Symptom Sessions",   value: symptomHistory.length,        sub: "AI consultations",     color: "#22c55e", href: "/symptom-mapper",     icon: "💬" },
      { label: "Vitals Readings",    value: vitalsHistory.length,         sub: "logged readings",      color: "#ec4899", href: "/vitals",             icon: "📈" },
      { label: "Med Reminders",      value: meds.length,                  sub: "medications tracked",  color: "#eab308", href: "/medication-reminder",icon: "⏰" },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🏥</span> Health Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, <strong>{user?.displayName ?? user?.email}</strong>. Here&apos;s your health overview.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center group">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Vitals */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Latest Vitals</h2>
            <Link href="/vitals" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
          </div>
          {vitalsLatest ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "bloodPressureSys", label: "BP Systolic",  unit: "mmHg", color: "#ef4444" },
                { key: "bloodPressureDia", label: "BP Diastolic", unit: "mmHg", color: "#f97316" },
                { key: "bloodSugar",       label: "Blood Sugar",  unit: "mg/dL",color: "#eab308" },
                { key: "heartRate",        label: "Heart Rate",   unit: "bpm",  color: "#ec4899" },
                { key: "spo2",             label: "SpO₂",         unit: "%",    color: "#06b6d4" },
                { key: "temperature",      label: "Temp",         unit: "°C",   color: "#f43f5e" },
              ].map((f) => vitalsLatest[f.key] ? (
                <div key={f.key} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{f.label}</div>
                  <div className="text-lg font-bold" style={{ color: f.color }}>
                    {vitalsLatest[f.key]} <span className="text-xs font-normal text-gray-400">{f.unit}</span>
                  </div>
                </div>
              ) : null)}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No vitals logged yet.</p>
              <Link href="/vitals" className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block hover:underline">Log now →</Link>
            </div>
          )}
        </div>

        {/* Medication Reminders */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">⏰ Today&apos;s Medications</h2>
            <Link href="/medication-reminder" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Manage →</Link>
          </div>
          {reminders.length > 0 ? (
            <div className="space-y-2">
              {reminders.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">💊 {r.name}</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{r.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No medications set.</p>
              <Link href="/medication-reminder" className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block hover:underline">Add reminder →</Link>
            </div>
          )}
        </div>

        {/* Quick access */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/xray-analyzer",       icon: "🫁", label: "X-Ray Analyzer"  },
              { href: "/allergy-checker",     icon: "🌿", label: "Allergy Checker" },
              { href: "/mental-health",       icon: "🧠", label: "Mental Health"   },
              { href: "/bmi-calculator",      icon: "📏", label: "BMI Calculator"  },
              { href: "/drug-interaction",    icon: "⚗️", label: "Drug Check"      },
              { href: "/prescription-scanner",icon: "📜", label: "Rx Scanner"      },
              { href: "/emergency-sos",       icon: "🚨", label: "Emergency SOS"   },
              { href: "/history",             icon: "📋", label: "Scan History"    },
            ].map((q) => (
              <Link key={q.href} href={q.href}
                className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
                <span className="text-2xl">{q.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
