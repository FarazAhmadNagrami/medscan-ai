"use client";

import { useState } from "react";
import { callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";
import Disclaimer from "@/components/Disclaimer";
import ShareButtons from "@/components/ShareButtons";

const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly — or being so fidgety that others noticed",
  "Thoughts that you would be better off dead or of hurting yourself",
];

const OPTIONS = [
  { label: "Not at all",         score: 0 },
  { label: "Several days",       score: 1 },
  { label: "More than half",     score: 2 },
  { label: "Nearly every day",   score: 3 },
];

function phqSeverity(score: number) {
  if (score <= 4)  return { label: "Minimal",  color: "#22c55e", advice: "You're doing well. Keep up healthy habits." };
  if (score <= 9)  return { label: "Mild",     color: "#eab308", advice: "Consider talking to someone you trust or a counselor." };
  if (score <= 14) return { label: "Moderate", color: "#f97316", advice: "It would be beneficial to speak with a mental health professional." };
  if (score <= 19) return { label: "Moderately Severe", color: "#ef4444", advice: "Please reach out to a mental health professional soon." };
  return                  { label: "Severe",   color: "#dc2626", advice: "Please seek professional help immediately. You don't have to face this alone." };
}

interface AIResult {
  summary: string;
  coping_strategies: string[];
  professional_resources: string[];
  affirmation: string;
}

export default function MentalHealth() {
  const [answers, setAnswers]   = useState<number[]>(Array(9).fill(-1));
  const [mood, setMood]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const score = answers.reduce((s, a) => s + (a >= 0 ? a : 0), 0);
  const allAnswered = answers.every((a) => a >= 0);
  const sev = phqSeverity(score);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitted(true);
    setLoading(true);
    setError(null);
    try {
      const answersSummary = PHQ9.map((q, i) => `Q: ${q} → ${OPTIONS[answers[i]].label}`).join("\n");
      const prompt = `A patient completed the PHQ-9 depression screening. Total score: ${score}/27 (${sev.label} depression severity).\n\nAnswers:\n${answersSummary}\n\nAdditional mood note: ${mood || "None"}\n\nProvide a compassionate, helpful response as JSON: summary (string), coping_strategies (array of 5 practical tips), professional_resources (array of 3 resource types), affirmation (one positive encouraging sentence).`;
      const raw = await callGeminiText(prompt);
      const parsed = parseJSON<AIResult>(raw);
      if (!parsed) throw new Error("Could not parse result");
      setAiResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally { setLoading(false); }
  };

  const reset = () => { setAnswers(Array(9).fill(-1)); setMood(""); setSubmitted(false); setAiResult(null); setError(null); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">🧠</span> Mental Health Check
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">PHQ-9 Depression Screening + AI-powered coping strategies.</p>
      </div>

      {!submitted && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-700 dark:text-blue-300">
            Over the <strong>last 2 weeks</strong>, how often have you been bothered by the following?
          </div>

          {PHQ9.map((q, i) => (
            <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">{i + 1}. {q}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OPTIONS.map((opt) => (
                  <button key={opt.score} onClick={() => { const a = [...answers]; a[i] = opt.score; setAnswers(a); }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${answers[i] === opt.score ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
              Anything else you&apos;d like to share about how you&apos;re feeling? (optional)
            </label>
            <textarea value={mood} onChange={(e) => setMood(e.target.value)} rows={3} placeholder="I've been feeling..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={!allAnswered}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors">
            {allAnswered ? "Get My Results" : `Answer all questions (${answers.filter(a => a >= 0).length}/9)`}
          </button>
        </div>
      )}

      {submitted && (
        <div className="space-y-4">
          {/* Score card */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-5xl font-extrabold mb-1" style={{ color: sev.color }}>{score}<span className="text-2xl font-normal text-gray-400">/27</span></div>
            <div className="text-xl font-bold mb-2" style={{ color: sev.color }}>{sev.label} Depression</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{sev.advice}</p>
            <div className="mt-4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(score / 27) * 100}%`, backgroundColor: sev.color }} />
            </div>
          </div>

          {loading && <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-sm text-gray-500">Getting AI support...</p></div>}

          {error && (error === RATE_LIMIT_ERROR ? <RateLimitError onRetry={handleSubmit} /> : <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm">❌ {error}</div>)}

          {aiResult && (
            <>
              <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-300 italic">&quot;{aiResult.affirmation}&quot;</p>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Summary</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{aiResult.summary}</p>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🌱 Coping Strategies</h3>
                <ul className="space-y-2">{aiResult.coping_strategies.map((s, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"><span className="text-blue-500 flex-shrink-0">→</span>{s}</li>)}</ul>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🆘 Professional Resources</h3>
                <ul className="space-y-2">{aiResult.professional_resources.map((s, i) => <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{s}</li>)}</ul>
              </div>
              <div className="flex gap-3 flex-wrap pt-1">
                <ShareButtons title="Mental Health Check" text={`PHQ-9 Score: ${score}/27 (${sev.label})\n\n${aiResult.summary}`} />
              </div>
            </>
          )}

          <button onClick={reset} className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Retake Assessment
          </button>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
