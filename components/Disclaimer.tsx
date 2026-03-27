export default function Disclaimer() {
  return (
    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl flex gap-3">
      <span className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0">⚠️</span>
      <p className="text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Medical Disclaimer:</strong> This tool is for informational
        purposes only and is <strong>not a substitute for professional medical
        advice</strong>, diagnosis, or treatment. Always consult a qualified
        healthcare provider before making any medical decisions.
      </p>
    </div>
  );
}
