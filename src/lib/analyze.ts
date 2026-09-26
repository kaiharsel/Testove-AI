import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import { CATEGORIES } from "./categories";
import type { Lang } from "./i18n";

export { CATEGORIES };

const AnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(CATEGORIES),
  summary: z.string().min(1),
  draft_reply: z.string().min(1),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const SYSTEM = `Ти — асистент служби підтримки інтернет-магазину. Аналізуй звернення клієнта.
Правила пріоритету:
- high: гроші списано без результату, загроза безпеці/здоровʼю, повна неможливість користуватись сервісом, сильне невдоволення з погрозою піти/скаргою.
- medium: затримка доставки, проблема, що має обхідний шлях, запит на повернення.
- low: загальні питання, побажання, подяки.
Категорія — завжди одне зі значень переліку як є (українською), незалежно від мови відповіді.
Підсумок — рівно одне речення мовою, вказаною в запиті.
Чернетка відповіді — ввічлива, конкретна, мовою, вказаною в запиті, звертайся до клієнта на імʼя, без вигаданих фактів (номерів замовлень, дат, сум).`;

const OUTPUT_LANGUAGE: Record<Lang, string> = { uk: "українською", en: "англійською (English)" };

// JSON schema shared by both providers so the model must return separate fields, not free text.
const JSON_SCHEMA = {
  type: "object",
  properties: {
    priority: { type: "string", enum: ["low", "medium", "high"] },
    category: { type: "string", enum: [...CATEGORIES] },
    summary: { type: "string", description: "Одне речення" },
    draft_reply: { type: "string", description: "Чернетка відповіді клієнту" },
  },
  required: ["priority", "category", "summary", "draft_reply"],
};

export async function analyzeTicket(customerName: string, message: string, lang: Lang = "uk"): Promise<Analysis> {
  const prompt = `Імʼя клієнта: ${customerName}\n\nЗвернення:\n${message}\n\nМова підсумку та чернетки відповіді: ${OUTPUT_LANGUAGE[lang]}.`;
  if (process.env.GEMINI_API_KEY) return AnalysisSchema.parse(await analyzeWithGemini(prompt));
  if (process.env.ANTHROPIC_API_KEY) return AnalysisSchema.parse(await analyzeWithClaude(prompt));
  throw new Error("Set GEMINI_API_KEY or ANTHROPIC_API_KEY");
}

// Free-tier models often answer 503 (overloaded) or 429 (rate limit), so fall back to other models.
const GEMINI_MODELS = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-3.5-flash", "gemini-flash-lite-latest"].filter(
  (m): m is string => Boolean(m),
);

async function analyzeWithGemini(prompt: string): Promise<unknown> {
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      return await callGemini(model, prompt);
    } catch (e) {
      lastError = e;
      if (!(e instanceof RetryableError)) throw e;
      console.warn(`Gemini ${model} unavailable, trying next model`);
    }
  }
  throw lastError;
}

class RetryableError extends Error {}

async function callGemini(model: string, prompt: string): Promise<unknown> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseJsonSchema: JSON_SCHEMA },
    }),
  });
  if (!res.ok) throw new ([404, 429, 500, 503].includes(res.status) ? RetryableError : Error)(`Gemini API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return JSON.parse(text);
}

async function analyzeWithClaude(prompt: string): Promise<unknown> {
  const client = new Anthropic();
  // Forced tool use makes the model return JSON matching the schema instead of free text.
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM,
    tool_choice: { type: "tool", name: "save_analysis" },
    tools: [{ name: "save_analysis", description: "Зберегти структурований аналіз звернення", input_schema: JSON_SCHEMA as Anthropic.Tool.InputSchema }],
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("LLM did not return structured output");
  return block.input;
}
