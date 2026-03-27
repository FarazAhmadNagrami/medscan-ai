import ModuleCard from "@/components/ModuleCard";

const modules = [
  {
    title: "Pill Identifier",
    description:
      "Upload a photo of any pill or tablet. Get instant AI identification with dosage, uses, side effects, and FDA cross-reference.",
    icon: "💊",
    href: "/pill-identifier",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-400",
    badge: "Vision AI",
  },
  {
    title: "Lab Report AI",
    description:
      "Upload a blood test PDF and get plain-English explanations for every value. Color-coded flags for normal, low, and high results.",
    icon: "🧪",
    href: "/lab-report",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-400",
    badge: "PDF Analysis",
  },
  {
    title: "SkinScan",
    description:
      "Upload a photo of a skin condition. Receive top 3 possible diagnoses with urgency levels and recommended actions.",
    icon: "🔍",
    href: "/skin-scan",
    gradient: "bg-gradient-to-br from-orange-500 to-amber-400",
    badge: "Vision AI",
  },
  {
    title: "Symptom Mapper",
    description:
      "Describe your symptoms in natural language. Get mapped conditions, specialist recommendations, and follow-up questions.",
    icon: "💬",
    href: "/symptom-mapper",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-400",
    badge: "Chat AI",
  },
  {
    title: "Diet Advisor",
    description:
      "Enter your health metrics or upload a report. Receive a personalized 7-day meal plan tailored to your numbers.",
    icon: "🥗",
    href: "/diet-advisor",
    gradient: "bg-gradient-to-br from-teal-500 to-lime-400",
    badge: "Nutrition AI",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block" />
          Powered by Gemini 1.5 Flash
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Your AI Medical{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Assistant
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
          Five intelligent modules to help you understand medications, lab
          results, skin conditions, symptoms, and diet — all in one place.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <ModuleCard key={mod.href} {...mod} />
        ))}
      </div>

      {/* Stats strip */}
      <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {[
          { label: "AI Model", value: "Gemini 1.5" },
          { label: "Modules", value: "5" },
          { label: "Drug Database", value: "RxNorm" },
          { label: "Response Time", value: "~3s" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer banner */}
      <div className="mt-10 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl text-center text-sm text-yellow-800 dark:text-yellow-300">
        ⚠️ MedScan AI is for informational purposes only. It is{" "}
        <strong>not a substitute for professional medical advice</strong>.
        Always consult a qualified healthcare provider.
      </div>
    </div>
  );
}
