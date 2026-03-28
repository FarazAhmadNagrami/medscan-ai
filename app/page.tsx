import Link from "next/link";

const modules = [
  { title: "Health Dashboard",       icon: "🏥", href: "/health-dashboard",      gradient: "from-blue-600 to-cyan-500",    badge: "Overview",    desc: "Your personal health overview — vitals, recent scans, medications, and quick access to all tools." },
  { title: "Pill Identifier",        icon: "💊", href: "/pill-identifier",        gradient: "from-blue-500 to-cyan-400",    badge: "Vision AI",   desc: "Upload a pill photo for instant AI identification with dosage, uses, side effects, and FDA cross-reference." },
  { title: "Lab Report AI",          icon: "🧪", href: "/lab-report",             gradient: "from-purple-500 to-pink-400",  badge: "PDF AI",      desc: "Upload a blood test PDF and get plain-English explanations with color-coded normal/abnormal flags." },
  { title: "SkinScan",               icon: "🔍", href: "/skin-scan",              gradient: "from-orange-500 to-amber-400", badge: "Vision AI",   desc: "Upload a skin photo for top 3 AI-diagnosed conditions with urgency levels and recommended actions." },
  { title: "Symptom Mapper",         icon: "💬", href: "/symptom-mapper",         gradient: "from-green-500 to-emerald-400",badge: "Chat AI",     desc: "Describe symptoms in natural language. Get mapped conditions, specialist recommendations, and body map." },
  { title: "Diet Advisor",           icon: "🥗", href: "/diet-advisor",           gradient: "from-teal-500 to-lime-400",    badge: "Nutrition AI",desc: "Enter health metrics or upload a report. Receive a personalized 7-day meal plan." },
  { title: "Drug Interaction",       icon: "⚗️", href: "/drug-interaction",       gradient: "from-red-500 to-rose-400",     badge: "Safety AI",   desc: "Enter 2+ medications to check for interactions, contraindications, and severity-rated warnings." },
  { title: "Prescription Scanner",   icon: "📜", href: "/prescription-scanner",   gradient: "from-indigo-500 to-blue-400",  badge: "Vision AI",   desc: "Photograph a prescription for a plain-English breakdown of every medication and dosage." },
  { title: "Vitals Tracker",         icon: "📈", href: "/vitals",                 gradient: "from-pink-500 to-fuchsia-400", badge: "Tracker",     desc: "Log BP, blood sugar, SpO₂, temperature with time. Each metric gets its own trend chart." },
  { title: "X-Ray / MRI Analyzer",   icon: "🫁", href: "/xray-analyzer",          gradient: "from-slate-500 to-gray-400",   badge: "Vision AI",   desc: "Upload X-rays, MRI, CT scans, or ultrasounds for AI-powered findings and recommendations." },
  { title: "Allergy Checker",        icon: "🌿", href: "/allergy-checker",        gradient: "from-green-600 to-teal-500",   badge: "AI",          desc: "Photo or text-based allergen detection for food, plants, insects, and skin reactions." },
  { title: "Mental Health Check",    icon: "🧠", href: "/mental-health",          gradient: "from-violet-500 to-purple-400",badge: "PHQ-9 AI",    desc: "PHQ-9 depression screening with AI-powered coping strategies and professional resources." },
  { title: "BMI & Health Score",     icon: "📏", href: "/bmi-calculator",         gradient: "from-cyan-500 to-blue-400",    badge: "Calculator",  desc: "Calculate BMI, get a health score out of 100, and see personalized advice based on your metrics." },
  { title: "Medication Reminder",    icon: "⏰", href: "/medication-reminder",    gradient: "from-yellow-500 to-orange-400",badge: "Push Notif",  desc: "Set up browser push notification reminders for your daily medications with dosage and frequency." },
  { title: "Emergency SOS",          icon: "🚨", href: "/emergency-sos",          gradient: "from-red-600 to-red-500",      badge: "Critical",    desc: "Find nearest hospitals on a live map. One-tap emergency calling. Country-wise emergency numbers." },
  { title: "Scan History",           icon: "📋", href: "/history",               gradient: "from-gray-500 to-slate-400",   badge: "Local",       desc: "Browse your complete scan timeline across all modules. All data stored locally and privately." },
  { title: "Food Calorie Scanner",   icon: "🍽️", href: "/food-scanner",           gradient: "from-orange-500 to-yellow-400", badge: "Vision AI",   desc: "Snap a meal photo — AI instantly identifies every item and calculates full nutrition & calories." },
  { title: "Water Tracker",          icon: "💧", href: "/water-tracker",          gradient: "from-cyan-500 to-blue-400",    badge: "Tracker",     desc: "Tap to log water intake with animated progress ring. Customizable daily goal." },
  { title: "Health Goals",           icon: "🎯", href: "/health-goals",           gradient: "from-green-500 to-teal-400",   badge: "Goals",       desc: "Set health targets for weight, BP, blood sugar, steps, and more. Track progress with deadlines." },
  { title: "Exercise Log",           icon: "🏃", href: "/exercise-log",           gradient: "from-purple-500 to-violet-400",badge: "Fitness",     desc: "Log workouts with calorie burn estimates. Weekly activity bar chart included." },
  { title: "Emergency Medical Card", icon: "🆘", href: "/medical-card",           gradient: "from-red-600 to-rose-500",     badge: "QR Code",     desc: "Store critical health info. Generate a QR code card to show first responders in an emergency." },
  { title: "Share with Doctor",      icon: "📋", href: "/share-doctor",           gradient: "from-blue-600 to-indigo-500",  badge: "Export",      desc: "Print or copy a complete health summary — vitals, meds, goals, nutrition — for your appointment." },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
          Powered by Gemini Vision AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Your AI Medical{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Assistant</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          22 intelligent modules — pills, lab reports, skin, symptoms, vitals, X-rays, food scanner, water tracker, goals, and more.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((mod) => (
          <Link key={mod.href} href={mod.href}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.gradient} rounded-t-2xl`} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{mod.icon}</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                {mod.badge}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {mod.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{mod.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: "AI Model",    value: "Gemini Flash" },
          { label: "Modules",    value: "22" },
          { label: "Drug DB",    value: "RxNorm FDA" },
          { label: "Cost",       value: "100% Free" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center text-sm text-yellow-800 dark:text-yellow-300">
        ⚠️ MedScan AI is for informational purposes only. It is <strong>not a substitute for professional medical advice</strong>. Always consult a qualified healthcare provider.
      </div>
    </div>
  );
}
