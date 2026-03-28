import { NextRequest, NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

function friendlyError(status: number): string {
  switch (status) {
    case 429: return "RATE_LIMIT_429";
    case 400: return "Invalid request. Please try a different image or input.";
    case 401:
    case 403: return "API key is invalid or missing on the server.";
    case 500:
    case 503: return "Gemini service temporarily unavailable. Please try again.";
    default:  return `API error (${status}). Please try again.`;
  }
}

export async function POST(req: NextRequest) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured on server." }, { status: 500 });
  }

  const body = await req.json() as {
    type: "text" | "image";
    prompt: string;
    base64?: string;
    mimeType?: string;
  };

  const parts =
    body.type === "image" && body.base64 && body.mimeType
      ? [{ text: body.prompt }, { inline_data: { mime_type: body.mimeType, data: body.base64 } }]
      : [{ text: body.prompt }];

  const geminiRes = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
    }),
  });

  if (!geminiRes.ok) {
    return NextResponse.json({ error: friendlyError(geminiRes.status) }, { status: geminiRes.status });
  }

  const data = await geminiRes.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ text });
}
