"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const modules = [
  { title: "Health Dashboard",       icon: "🏥", href: "/health-dashboard",      gradient: "from-blue-600 to-cyan-500",     badge: "Overview",     desc: "Your personal health overview — vitals, recent scans, medications, and quick access to all tools." },
  { title: "Pill Identifier",        icon: "💊", href: "/pill-identifier",        gradient: "from-blue-500 to-cyan-400",     badge: "Vision AI",    desc: "Upload a pill photo for instant AI identification with dosage, uses, side effects, and FDA cross-reference." },
  { title: "Lab Report AI",          icon: "🧪", href: "/lab-report",             gradient: "from-purple-500 to-pink-400",   badge: "PDF AI",       desc: "Upload a blood test PDF and get plain-English explanations with color-coded normal/abnormal flags." },
  { title: "SkinScan",               icon: "🔍", href: "/skin-scan",              gradient: "from-orange-500 to-amber-400",  badge: "Vision AI",    desc: "Upload a skin photo for top 3 AI-diagnosed conditions with urgency levels and recommended actions." },
  { title: "Symptom Mapper",         icon: "💬", href: "/symptom-mapper",         gradient: "from-green-500 to-emerald-400", badge: "Chat AI",      desc: "Describe symptoms in natural language. Get mapped conditions, specialist recommendations, and body map." },
  { title: "Diet Advisor",           icon: "🥗", href: "/diet-advisor",           gradient: "from-teal-500 to-lime-400",     badge: "Nutrition AI", desc: "Enter health metrics or upload a report. Receive a personalized 7-day meal plan." },
  { title: "Drug Interaction",       icon: "⚗️", href: "/drug-interaction",       gradient: "from-red-500 to-rose-400",      badge: "Safety AI",    desc: "Enter 2+ medications to check for interactions, contraindications, and severity-rated warnings." },
  { title: "Prescription Scanner",   icon: "📜", href: "/prescription-scanner",   gradient: "from-indigo-500 to-blue-400",   badge: "Vision AI",    desc: "Photograph a prescription for a plain-English breakdown of every medication and dosage." },
  { title: "Vitals Tracker",         icon: "📈", href: "/vitals",                 gradient: "from-pink-500 to-fuchsia-400",  badge: "Tracker",      desc: "Log BP, blood sugar, SpO₂, temperature with time. Each metric gets its own trend chart." },
  { title: "X-Ray / MRI Analyzer",   icon: "🫁", href: "/xray-analyzer",          gradient: "from-slate-500 to-gray-400",    badge: "Vision AI",    desc: "Upload X-rays, MRI, CT scans, or ultrasounds for AI-powered findings and recommendations." },
  { title: "Allergy Checker",        icon: "🌿", href: "/allergy-checker",        gradient: "from-green-600 to-teal-500",    badge: "AI",           desc: "Photo or text-based allergen detection for food, plants, insects, and skin reactions." },
  { title: "Mental Health Check",    icon: "🧠", href: "/mental-health",          gradient: "from-violet-500 to-purple-400", badge: "PHQ-9 AI",     desc: "PHQ-9 depression screening with AI-powered coping strategies and professional resources." },
  { title: "BMI & Health Score",     icon: "📏", href: "/bmi-calculator",         gradient: "from-cyan-500 to-blue-400",     badge: "Calculator",   desc: "Calculate BMI, get a health score out of 100, and see personalized advice based on your metrics." },
  { title: "Medication Reminder",    icon: "⏰", href: "/medication-reminder",    gradient: "from-yellow-500 to-orange-400", badge: "Push Notif",   desc: "Set up browser push notification reminders for your daily medications with dosage and frequency." },
  { title: "Emergency SOS",          icon: "🚨", href: "/emergency-sos",          gradient: "from-red-600 to-red-500",       badge: "Critical",     desc: "Find nearest hospitals on a live map. One-tap emergency calling. Country-wise emergency numbers." },
  { title: "Scan History",           icon: "📋", href: "/history",                gradient: "from-gray-500 to-slate-400",    badge: "Local",        desc: "Browse your complete scan timeline across all modules. All data stored locally and privately." },
  { title: "Food Calorie Scanner",   icon: "🍽️", href: "/food-scanner",           gradient: "from-orange-500 to-yellow-400", badge: "Vision AI",    desc: "Snap a meal photo — AI instantly identifies every item and calculates full nutrition & calories." },
  { title: "Water Tracker",          icon: "💧", href: "/water-tracker",          gradient: "from-cyan-500 to-blue-400",     badge: "Tracker",      desc: "Tap to log water intake with animated progress ring. Customizable daily goal." },
  { title: "Health Goals",           icon: "🎯", href: "/health-goals",           gradient: "from-green-500 to-teal-400",    badge: "Goals",        desc: "Set health targets for weight, BP, blood sugar, steps, and more. Track progress with deadlines." },
  { title: "Exercise Log",           icon: "🏃", href: "/exercise-log",           gradient: "from-purple-500 to-violet-400", badge: "Fitness",      desc: "Log workouts with calorie burn estimates. Weekly activity bar chart included." },
  { title: "Emergency Medical Card", icon: "🆘", href: "/medical-card",           gradient: "from-red-600 to-rose-500",      badge: "QR Code",      desc: "Store critical health info. Generate a QR code card to show first responders in an emergency." },
  { title: "Share with Doctor",      icon: "📋", href: "/share-doctor",           gradient: "from-blue-600 to-indigo-500",   badge: "Export",       desc: "Print or copy a complete health summary — vitals, meds, goals, nutrition — for your appointment." },
];

const categories = ["All", "Vision AI", "AI Assistants", "Trackers", "Tools"];

const getCategory = (badge: string) => {
  if (badge.includes("Vision")) return "Vision AI";
  if (badge.includes("AI")) return "AI Assistants";
  if (badge.includes("Tracker") || badge.includes("Goals") || badge.includes("Fitness") || badge.includes("Local")) return "Trackers";
  return "Tools";
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch = mod.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            mod.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || getCategory(mod.badge) === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleCard = (href: string) => {
    if (loading) return;
    if (user) {
      router.push(href);
    } else {
      router.push(`/login?from=${encodeURIComponent(href)}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-screen">
      {/* Hero */}
      <div className="relative text-center mb-16 pt-8 pb-12 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 flex justify-center opacity-30 dark:opacity-20 pointer-events-none">
          <div className="w-[800px] h-[400px] bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite] opacity-50 mix-blend-multiply dark:mix-blend-screen" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/80 backdrop-blur-md dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800/50 shadow-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
            Powered by Gemini Vision AI
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Your AI Medical{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            22 intelligent modules — pills, lab reports, skin, symptoms, vitals, X-rays, food scanner, water tracker, and more.
          </p>
          {!user && !loading && (
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign In to Get Started
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-3xl mx-auto mb-12 space-y-6 relative z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm focus:shadow-md text-lg"
            placeholder="Search 22 modules (e.g., 'diet', 'pill', 'blood pressure')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module grid */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No modules found</h3>
          <p>Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredModules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => handleCard(mod.href)}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden text-left flex flex-col h-full"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${mod.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
              
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0 text-gray-400 group-hover:text-blue-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-3xl shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {mod.icon}
                </div>
              </div>
              
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {mod.title}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-grow">
                {mod.desc}
              </p>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200/50 dark:border-gray-600/50">
                  {mod.badge}
                </span>
                
                {!user && !loading && (
                  <span className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wide">
                    Sign in
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
        {[
          { label: "AI Model",  value: "Gemini Flash", icon: "✨" },
          { label: "Modules",   value: "22", icon: "🧩" },
          { label: "Drug DB",   value: "RxNorm FDA", icon: "⚕️" },
          { label: "Cost",      value: "100% Free", icon: "💝" },
        ].map((s) => (
          <div key={s.label} className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            <span className="text-2xl mb-2 block">{s.icon}</span>
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{s.value}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-5 bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-700/50 rounded-2xl text-center text-sm text-yellow-800 dark:text-yellow-300 shadow-sm relative z-10 max-w-4xl mx-auto flex items-center justify-center">
        <span className="mr-3 text-xl">⚠️</span> 
        <p>
          MedScan AI is for informational purposes only. It is{" "}
          <strong className="font-semibold">not a substitute for professional medical advice</strong>. Always consult a qualified healthcare provider.
        </p>
      </div>
    </div>
  );
}
