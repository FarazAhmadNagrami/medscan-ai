"use client";

import { useState } from "react";

const BODY_PARTS = [
  { id: "head", label: "Head / Brain", x: 95, y: 18, r: 18 },
  { id: "neck", label: "Throat / Neck", x: 95, y: 44, r: 8 },
  { id: "chest", label: "Chest / Heart", x: 95, y: 80, r: 20 },
  { id: "abdomen", label: "Abdomen / Stomach", x: 95, y: 125, r: 18 },
  { id: "pelvis", label: "Pelvis / Lower Abdomen", x: 95, y: 162, r: 14 },
  { id: "left-shoulder", label: "Left Shoulder / Arm", x: 55, y: 68, r: 10 },
  { id: "right-shoulder", label: "Right Shoulder / Arm", x: 135, y: 68, r: 10 },
  { id: "left-knee", label: "Left Knee / Leg", x: 75, y: 240, r: 10 },
  { id: "right-knee", label: "Right Knee / Leg", x: 115, y: 240, r: 10 },
  { id: "left-foot", label: "Left Foot / Ankle", x: 75, y: 295, r: 8 },
  { id: "right-foot", label: "Right Foot / Ankle", x: 115, y: 295, r: 8 },
  { id: "back", label: "Back / Spine", x: 95, y: 105, r: 12 },
];

interface BodyMapProps {
  onSelect: (parts: string[]) => void;
}

export default function BodyMap({ onSelect }: BodyMapProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string, label: string) => {
    const newSelected = selected.includes(label)
      ? selected.filter((s) => s !== label)
      : [...selected, label];
    setSelected(newSelected);
    onSelect(newSelected);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
        Tap body parts to mark pain/symptom locations (optional)
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <svg viewBox="0 0 190 320" width="150" className="flex-shrink-0">
          {/* Body outline */}
          <ellipse cx="95" cy="18" rx="17" ry="17" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="80" y="35" width="30" height="12" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="65" y="47" width="60" height="75" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="42" y="50" width="25" height="65" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="123" y="50" width="25" height="65" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="70" y="122" width="25" height="90" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="95" y="122" width="25" height="90" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="70" y="212" width="25" height="85" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />
          <rect x="95" y="212" width="25" height="85" rx="8" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5" />

          {/* Clickable hotspots */}
          {BODY_PARTS.map((part) => {
            const isActive = selected.includes(part.label);
            return (
              <circle
                key={part.id}
                cx={part.x}
                cy={part.y}
                r={part.r}
                fill={isActive ? "#3b82f6" : "transparent"}
                stroke={isActive ? "#2563eb" : "#9ca3af"}
                strokeWidth="1.5"
                strokeDasharray={isActive ? "0" : "3 2"}
                opacity={isActive ? 0.85 : 0.5}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggle(part.id, part.label)}
              />
            );
          })}
        </svg>

        <div className="flex-1">
          {selected.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Selected areas:</p>
              {selected.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-600 italic">No areas selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
