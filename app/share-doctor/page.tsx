"use client";

import { useEffect, useRef, useState } from "react";

interface VitalsEntry { id: string; datetime: string; [key: string]: unknown }
interface FoodEntry   { id: string; time: string; meal_name: string; total_calories: number }
interface WaterEntry  { id: string; time: string; ml: number; label: string }
interface MedEntry    { id: string; name: string; dosage: string; frequency: string; enabled: boolean }
interface GoalEntry   { id: string; title: string; category: string; current: number; target: number; unit: string }
interface MedCard     { name: string; dob: string; bloodType: string; allergies: string; conditions: string; medications: string; emergencyContact: string; emergencyPhone: string; doctorName: string; doctorPhone: string; notes: string }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0 gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value || "—"}</span>
    </div>
  );
}

export default function ShareDoctorPage() {
  const [card, setCard]       = useState<MedCard | null>(null);
  const [vitals, setVitals]   = useState<VitalsEntry[]>([]);
  const [food, setFood]       = useState<FoodEntry[]>([]);
  const [water, setWater]     = useState<WaterEntry[]>([]);
  const [meds, setMeds]       = useState<MedEntry[]>([]);
  const [goals, setGoals]     = useState<GoalEntry[]>([]);
  const [copied, setCopied]   = useState(false);
  const printRef              = useRef<HTMLDivElement>(null);

  const today = new Date().toDateString();

  useEffect(() => {
    const mc = localStorage.getItem("medical_card");
    if (mc) setCard(JSON.parse(mc));

    const v: VitalsEntry[] = JSON.parse(localStorage.getItem("vitals_history_v2") ?? "[]");
    setVitals(v.slice(0, 10));

    const f: FoodEntry[] = JSON.parse(localStorage.getItem("food_log") ?? "[]");
    setFood(f.filter((e) => new Date(e.time).toDateString() === today));

    const w: WaterEntry[] = JSON.parse(localStorage.getItem("water_log") ?? "[]");
    setWater(w.filter((e) => new Date(e.time).toDateString() === today));

    setMeds(JSON.parse(localStorage.getItem("medication_reminders") ?? "[]"));
    setGoals(JSON.parse(localStorage.getItem("health_goals") ?? "[]"));
  }, [today]);

  const totalCal   = food.reduce((s, e) => s + e.total_calories, 0);
  const totalWater = water.reduce((s, e) => s + e.ml, 0);

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Health Summary — ${card?.name ?? "Patient"}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; max-width: 700px; margin: 0 auto; color: #111; }
        h1 { font-size: 1.5rem; color: #1e3a8a; } h2 { font-size: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 20px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 0.875rem; }
        .label { color: #6b7280; } .value { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; } th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; }
      </style></head><body>
      <h1>📋 Patient Health Summary</h1>
      <p style="color:#6b7280;font-size:0.85rem;">Generated: ${new Date().toLocaleString()} — MedScan AI</p>
      ${html}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleCopyLink = () => {
    // Summarize as plain text
    const text = [
      `=== HEALTH SUMMARY — ${card?.name ?? "Patient"} ===`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      card ? `PATIENT INFO\nName: ${card.name} | DOB: ${card.dob} | Blood: ${card.bloodType}\nAllergies: ${card.allergies}\nConditions: ${card.conditions}\nMedications: ${card.medications}` : "",
      "",
      `TODAY'S NUTRITION\nCalories: ${totalCal} kcal | Water: ${totalWater} ml`,
      "",
      meds.length ? `CURRENT MEDICATIONS\n${meds.map((m) => `${m.name} ${m.dosage} — ${m.frequency}`).join("\n")}` : "",
      "",
      goals.length ? `HEALTH GOALS\n${goals.map((g) => `${g.title}: ${g.current}/${g.target} ${g.unit}`).join("\n")}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">📋</span> Share with Doctor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            One-tap health summary ready to print or copy for your appointment.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopyLink}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {copied ? "✅ Copied!" : "📋 Copy Text"}
          </button>
          <button onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700" ref={printRef}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{card?.name ?? "Patient"}</div>
            <div className="text-xs text-gray-400 mt-0.5">Generated {new Date().toLocaleDateString()} • MedScan AI</div>
          </div>
          {card?.bloodType && (
            <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-bold text-sm">
              {card.bloodType}
            </div>
          )}
        </div>

        {/* Patient Info */}
        {card && (
          <Section title="🪪 Patient Information">
            <Row label="Full Name"          value={card.name} />
            <Row label="Date of Birth"      value={card.dob} />
            <Row label="Allergies"          value={card.allergies || "None known"} />
            <Row label="Medical Conditions" value={card.conditions || "None"} />
            <Row label="Emergency Contact"  value={`${card.emergencyContact} — ${card.emergencyPhone}`} />
          </Section>
        )}

        {/* Current Medications */}
        {meds.length > 0 && (
          <Section title="💊 Current Medications">
            {meds.map((m) => (
              <Row key={m.id} label={m.name} value={`${m.dosage} • ${m.frequency}`} />
            ))}
          </Section>
        )}

        {/* Today's Nutrition */}
        <Section title={`🍽️ Today's Nutrition (${new Date().toLocaleDateString()})`}>
          <Row label="Total Calories" value={`${totalCal} kcal`} />
          <Row label="Total Water"    value={`${totalWater} ml`} />
          <Row label="Meals Logged"   value={food.length} />
          {food.map((f) => (
            <Row key={f.id} label={f.meal_name} value={`${f.total_calories} kcal`} />
          ))}
        </Section>

        {/* Recent Vitals */}
        {vitals.length > 0 && (
          <Section title="📈 Recent Vitals">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                    <th className="text-left py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">BP (Sys)</th>
                    <th className="text-left py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">BP (Dia)</th>
                    <th className="text-left py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">Blood Sugar</th>
                    <th className="text-left py-2 pr-3 text-gray-500 dark:text-gray-400 font-medium">Heart Rate</th>
                    <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">SpO₂</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-1.5 pr-3 text-gray-600 dark:text-gray-400">
                        {new Date(v.datetime as string).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-1.5 pr-3 font-medium text-gray-900 dark:text-white">{(v["BP (Systolic)"] as string) ?? "—"}</td>
                      <td className="py-1.5 pr-3 font-medium text-gray-900 dark:text-white">{(v["BP (Diastolic)"] as string) ?? "—"}</td>
                      <td className="py-1.5 pr-3 font-medium text-gray-900 dark:text-white">{(v["Blood Sugar"] as string) ?? "—"}</td>
                      <td className="py-1.5 pr-3 font-medium text-gray-900 dark:text-white">{(v["Heart Rate"] as string) ?? "—"}</td>
                      <td className="py-1.5 font-medium text-gray-900 dark:text-white">{(v["SpO₂"] as string) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Health Goals */}
        {goals.length > 0 && (
          <Section title="🎯 Health Goals">
            {goals.map((g) => (
              <Row key={g.id} label={g.title} value={`${g.current} → ${g.target} ${g.unit}`} />
            ))}
          </Section>
        )}

        {(!card && meds.length === 0 && vitals.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No health data yet</p>
            <p className="text-sm mt-1">Start using the app modules to generate your summary.</p>
          </div>
        )}
      </div>
    </div>
  );
}
