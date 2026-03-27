// Uses gemini-flash-latest (maps to gemini-3-flash-preview internally)
// Separate quota from gemini-2.0-flash — auth via X-goog-api-key header
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export const RATE_LIMIT_ERROR = "RATE_LIMIT_429";

function friendlyError(status: number): string {
  switch (status) {
    case 429:
      return RATE_LIMIT_ERROR;
    case 400:
      return "Invalid request. Please try a different image or input.";
    case 401:
    case 403:
      return "API key is invalid. Check NEXT_PUBLIC_GEMINI_API_KEY in .env.local.";
    case 500:
    case 503:
      return "Gemini service temporarily unavailable. Please try again.";
    default:
      return `API error (${status}). Please try again.`;
  }
}

export async function callGeminiText(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error("Gemini API key not configured in .env.local");

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) throw new Error(friendlyError(res.status));
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function callGeminiWithImage(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!GEMINI_KEY) throw new Error("Gemini API key not configured in .env.local");

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Image } },
          ],
        },
      ],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) throw new Error(friendlyError(res.status));
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export function parseJSON<T>(raw: string): T | null {
  try {
    const match = raw.match(/```json\s*([\s\S]*?)```/);
    const jsonStr = match ? match[1] : raw;
    return JSON.parse(jsonStr.trim()) as T;
  } catch {
    try {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1)
        return JSON.parse(raw.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
    return null;
  }
}
