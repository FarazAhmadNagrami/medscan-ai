"use client";

import { LANGUAGES, useLanguage } from "@/lib/language";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
        <span>{current?.flag}</span>
        <span className="hidden sm:inline">{current?.label}</span>
        <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl ${
              language === lang.code ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <span>{lang.flag}</span> {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
