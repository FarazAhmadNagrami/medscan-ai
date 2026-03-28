"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

const navLinks = [
  { href: "/health-dashboard",     label: "Dashboard" },
  { href: "/pill-identifier",      label: "PillID" },
  { href: "/lab-report",           label: "Lab" },
  { href: "/skin-scan",            label: "Skin" },
  { href: "/symptom-mapper",       label: "Symptoms" },
  { href: "/diet-advisor",         label: "Diet" },
  { href: "/drug-interaction",     label: "Drug Check" },
  { href: "/prescription-scanner", label: "Rx" },
  { href: "/vitals",               label: "Vitals" },
  { href: "/xray-analyzer",        label: "X-Ray" },
  { href: "/allergy-checker",      label: "Allergy" },
  { href: "/mental-health",        label: "Mental" },
  { href: "/bmi-calculator",       label: "BMI" },
  { href: "/medication-reminder",  label: "Reminders" },
  { href: "/emergency-sos",        label: "SOS 🚨" },
  { href: "/history",              label: "History" },
  { href: "/food-scanner",         label: "Food" },
  { href: "/water-tracker",        label: "Water" },
  { href: "/health-goals",         label: "Goals" },
  { href: "/exercise-log",         label: "Exercise" },
  { href: "/medical-card",         label: "Med Card" },
  { href: "/share-doctor",         label: "Share" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🔬</span>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MedScan AI
            </span>
          </Link>

          {/* Desktop nav — scrollable */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-[600px] scrollbar-hide">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  pathname === link.href
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button onClick={toggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <UserMenu />
            {/* Mobile menu button */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-3 grid grid-cols-3 gap-1.5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-colors ${
                  pathname === link.href
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
