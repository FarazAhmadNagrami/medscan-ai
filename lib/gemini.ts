export const RATE_LIMIT_ERROR = "RATE_LIMIT_429";

async function callGemini(body: { type: "text" | "image" | "images"; prompt: string; base64?: string; mimeType?: string; images?: { base64: string; mimeType: string }[] }): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json() as { text?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? `API error (${res.status})`);
  return data.text ?? "";
}

export async function callGeminiText(prompt: string): Promise<string> {
  return callGemini({ type: "text", prompt });
}

export async function callGeminiWithImage(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  return callGemini({ type: "image", prompt, base64: base64Image, mimeType });
}

export async function callGeminiWithImages(
  images: { base64: string; mimeType: string }[],
  prompt: string
): Promise<string> {
  return callGemini({ type: "images", prompt, images });
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
