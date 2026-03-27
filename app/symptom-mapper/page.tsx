"use client";

import { useState, useRef, useEffect } from "react";
import Disclaimer from "@/components/Disclaimer";
import { callGeminiText, parseJSON, RATE_LIMIT_ERROR } from "@/lib/gemini";
import RateLimitError from "@/components/RateLimitError";

interface Condition {
  name: string;
  probability: number;
}

interface AiResponse {
  conditions: Condition[];
  recommended_specialist: string;
  urgency_level: string;
  follow_up_questions: string[];
  disclaimer: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  parsed?: AiResponse;
}

const SYSTEM_PROMPT = `You are a medical symptom analyzer. Based on symptoms described, map to possible conditions with probability. Always recommend appropriate specialist type. Always add disclaimer that this is not a medical diagnosis. Return structured JSON with: conditions (array of {name, probability}), recommended_specialist (string), urgency_level (string: low/moderate/high/emergency), follow_up_questions (array of strings), disclaimer (string).`;

export default function SymptomMapper() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const conversation = history
        .map((m) => `${m.role === "user" ? "Patient" : "AI"}: ${m.content}`)
        .join("\n");

      const prompt = `${SYSTEM_PROMPT}\n\nConversation:\n${conversation}\n\nRespond with structured JSON.`;
      const raw = await callGeminiText(prompt);
      const parsed = parseJSON<AiResponse>(raw);

      const assistantMsg: Message = {
        role: "assistant",
        content: raw,
        parsed: parsed ?? undefined,
      };
      setMessages([...history, assistantMsg]);

      // Save to history
      if (parsed) {
        const existing = JSON.parse(localStorage.getItem("symptom_history") ?? "[]");
        existing.unshift({
          timestamp: new Date().toLocaleString(),
          symptoms: text,
          top_condition: parsed.conditions[0]?.name,
          urgency: parsed.urgency_level,
        });
        localStorage.setItem("symptom_history", JSON.stringify(existing.slice(0, 10)));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error";
      const isRateLimit = msg === RATE_LIMIT_ERROR;
      setMessages([
        ...history,
        {
          role: "assistant",
          content: isRateLimit
            ? "⏱️ Rate limit reached — Gemini free tier allows ~15 requests/minute. Please wait ~30 seconds and send your message again."
            : "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "emergency": return "text-red-600 dark:text-red-400 font-bold";
      case "high": return "text-orange-600 dark:text-orange-400 font-semibold";
      case "moderate": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-4xl">💬</span> Symptom Mapper
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Describe your symptoms in natural language for AI-powered analysis.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-lg font-medium">Start by describing your symptoms</p>
            <p className="text-sm mt-1">
              Example: &quot;I have a headache, fever, and sore throat for 2 days&quot;
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
              {[
                "I have chest pain and shortness of breath",
                "Persistent cough with yellow mucus for 5 days",
                "Severe headache behind the eyes with light sensitivity",
                "Abdominal pain, nausea, and loss of appetite",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[80%] px-4 py-3 bg-blue-600 text-white rounded-2xl rounded-tr-sm text-sm">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] space-y-3">
                {msg.parsed ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm p-5 space-y-4">
                    {/* Conditions */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Possible Conditions
                      </h4>
                      <div className="space-y-2">
                        {msg.parsed.conditions.map((c, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-48 truncate">
                              {c.name}
                            </span>
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${c.probability}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                              {c.probability}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Specialist + Urgency */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Recommended Specialist
                        </div>
                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                          {msg.parsed.recommended_specialist}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                          Urgency Level
                        </div>
                        <div className={`text-sm capitalize ${urgencyColor(msg.parsed.urgency_level)}`}>
                          {msg.parsed.urgency_level}
                        </div>
                      </div>
                    </div>

                    {/* Follow-up questions */}
                    {msg.parsed.follow_up_questions?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Follow-up Questions
                        </div>
                        <ul className="space-y-1">
                          {msg.parsed.follow_up_questions.map((q, k) => (
                            <li
                              key={k}
                              className="text-sm text-gray-700 dark:text-gray-300 flex gap-2"
                            >
                              <span className="text-blue-500">→</span> {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.parsed.disclaimer && (
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                        ⚠️ {msg.parsed.disclaimer}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {msg.content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2">Analyzing symptoms...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe your symptoms..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors"
        >
          Send
        </button>
      </div>

      <Disclaimer />
    </div>
  );
}
