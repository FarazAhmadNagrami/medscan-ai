"use client";

import { createContext, useContext, useState } from "react";

export const LANGUAGES = [
  { code: "English", label: "English", flag: "🇬🇧" },
  { code: "Urdu", label: "اردو", flag: "🇵🇰" },
  { code: "Arabic", label: "العربية", flag: "🇸🇦" },
  { code: "Hindi", label: "हिंदी", flag: "🇮🇳" },
  { code: "French", label: "Français", flag: "🇫🇷" },
  { code: "Spanish", label: "Español", flag: "🇪🇸" },
  { code: "German", label: "Deutsch", flag: "🇩🇪" },
  { code: "Turkish", label: "Türkçe", flag: "🇹🇷" },
];

const LanguageContext = createContext<{
  language: string;
  setLanguage: (l: string) => void;
}>({ language: "English", setLanguage: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("English");
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

export function withLanguage(prompt: string, language: string) {
  if (language === "English") return prompt;
  return `${prompt}\n\nIMPORTANT: Return ALL text fields, explanations, and descriptions in ${language} language. Keep medical terms in English but explain them in ${language}.`;
}
