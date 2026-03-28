"use client";

import { useState, useEffect, useRef } from "react";

interface MedicalCard {
  name: string;
  dob: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContact: string;
  emergencyPhone: string;
  doctorName: string;
  doctorPhone: string;
  notes: string;
}

const EMPTY: MedicalCard = {
  name: "", dob: "", bloodType: "", allergies: "", conditions: "",
  medications: "", emergencyContact: "", emergencyPhone: "",
  doctorName: "", doctorPhone: "", notes: "",
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function MedicalCardPage() {
  const [card, setCard]       = useState<MedicalCard>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState<MedicalCard>(EMPTY);
  const [qrUrl, setQrUrl]     = useState("");
  const printRef              = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("medical_card");
    if (saved) {
      const parsed = JSON.parse(saved) as MedicalCard;
      setCard(parsed);
      generateQr(parsed);
    } else {
      setEditing(true);
      setDraft(EMPTY);
    }
  }, []);

  const generateQr = (data: MedicalCard) => {
    const text = [
      `Name: ${data.name}`,
      `DOB: ${data.dob}`,
      `Blood: ${data.bloodType}`,
      `Allergies: ${data.allergies}`,
      `Conditions: ${data.conditions}`,
      `Meds: ${data.medications}`,
      `Emergency: ${data.emergencyContact} ${data.emergencyPhone}`,
      `Doctor: ${data.doctorName} ${data.doctorPhone}`,
    ].filter(Boolean).join(" | ");
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=1e3a8a`);
  };

  const saveCard = () => {
    localStorage.setItem("medical_card", JSON.stringify(draft));
    setCard(draft);
    generateQr(draft);
    setEditing(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Emergency Medical Card — ${card.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; }
        h1 { color: #1e3a8a; font-size: 1.4rem; margin-bottom: 4px; }
        .sub { color: #6b7280; font-size: 0.85rem; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .field label { font-size: 0.7rem; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
        .field p { font-size: 0.9rem; font-weight: 600; color: #111; margin: 2px 0 0; }
        .alert { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
        .alert p { color: #991b1b; font-size: 0.9rem; font-weight: 600; }
        .qr { text-align: center; margin-top: 20px; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>🆘 Emergency Medical Card</h1>
      <div class="sub">Scan QR code for full details</div>
      <div class="alert"><p>⚠️ Allergies: ${card.allergies || "None known"}</p></div>
      <div class="grid">
        <div class="field"><label>Full Name</label><p>${card.name}</p></div>
        <div class="field"><label>Date of Birth</label><p>${card.dob}</p></div>
        <div class="field"><label>Blood Type</label><p>${card.bloodType}</p></div>
        <div class="field"><label>Conditions</label><p>${card.conditions || "None"}</p></div>
        <div class="field"><label>Medications</label><p>${card.medications || "None"}</p></div>
        <div class="field"><label>Emergency Contact</label><p>${card.emergencyContact} — ${card.emergencyPhone}</p></div>
        <div class="field"><label>Doctor</label><p>${card.doctorName} — ${card.doctorPhone}</p></div>
      </div>
      ${card.notes ? `<div class="field"><label>Notes</label><p>${card.notes}</p></div>` : ""}
      <div class="qr"><img src="${qrUrl}" width="160" height="160" /></div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const Field = ({ label, val }: { label: string; val: string }) => (
    <div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{val || "—"}</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">🆘</span> Emergency Medical Card
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Store your critical health info. Share via QR code in emergencies.
          </p>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              🖨️ Print
            </button>
            <button onClick={() => { setDraft({ ...card }); setEditing(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
              ✏️ Edit
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Fill in your medical details</h2>
          <div className="grid grid-cols-2 gap-4">
            {([
              ["Full Name",        "name",             "text",   "John Doe"],
              ["Date of Birth",    "dob",              "date",   ""],
              ["Emergency Contact","emergencyContact", "text",   "Jane Doe"],
              ["Emergency Phone",  "emergencyPhone",  "tel",    "+1 555 000 0000"],
              ["Doctor Name",      "doctorName",       "text",   "Dr. Smith"],
              ["Doctor Phone",     "doctorPhone",      "tel",    "+1 555 111 1111"],
            ] as [string, keyof MedicalCard, string, string][]).map(([label, key, type, ph]) => (
              <div key={key}>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
                <input type={type} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  placeholder={ph}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Blood Type</label>
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map((bt) => (
                <button key={bt} onClick={() => setDraft({ ...draft, bloodType: bt })}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${draft.bloodType === bt ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
                  {bt}
                </button>
              ))}
            </div>
          </div>
          {([
            ["⚠️ Allergies (comma-separated)",    "allergies",   "e.g. Penicillin, Peanuts, Latex"],
            ["🩺 Medical Conditions",              "conditions",  "e.g. Type 2 Diabetes, Hypertension"],
            ["💊 Current Medications",             "medications", "e.g. Metformin 500mg, Lisinopril 10mg"],
            ["📝 Additional Notes",                "notes",       "e.g. Pacemaker fitted, latex allergy"],
          ] as [string, keyof MedicalCard, string][]).map(([label, key, ph]) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
              <textarea value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                placeholder={ph} rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={saveCard}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors">
              Save Card
            </button>
            {card.name && (
              <button onClick={() => setEditing(false)}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div ref={printRef} className="space-y-4">
          {/* Alert banner */}
          {card.allergies && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl">
              <div className="text-sm font-bold text-red-700 dark:text-red-300">⚠️ Allergies: {card.allergies}</div>
            </div>
          )}

          {/* Main card */}
          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">🆘</div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{card.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">DOB: {card.dob}</div>
              </div>
              <div className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full font-bold text-sm">
                {card.bloodType}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Medical Conditions" val={card.conditions} />
              <Field label="Medications"         val={card.medications} />
              <Field label="Emergency Contact"   val={`${card.emergencyContact}${card.emergencyPhone ? ` — ${card.emergencyPhone}` : ""}`} />
              <Field label="Doctor"              val={`${card.doctorName}${card.doctorPhone ? ` — ${card.doctorPhone}` : ""}`} />
            </div>
            {card.notes && <Field label="Notes" val={card.notes} />}
          </div>

          {/* QR code */}
          {qrUrl && (
            <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">QR Code — Show in Emergency</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="Medical QR Code" width={200} height={200} className="mx-auto rounded-xl border border-gray-200 dark:border-gray-700" />
              <p className="text-xs text-gray-400 mt-3">Scan to view full medical details. Print and keep in wallet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
