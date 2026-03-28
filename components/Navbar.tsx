"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MedScan AI
            </span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-base"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
