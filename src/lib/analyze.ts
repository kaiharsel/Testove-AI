import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const CATEGORIES = ["оплата", "доставка", "скарга", "технічна проблема", "повернення", "інше"] as const;

const AnalysisSchema = z.object({
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(CATEGORIES),
  summary: z.string().min(1),
  draft_reply: z.string().min(1),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

const SYSTEM = `Ти — асистент служби підтримки інтернет-магазину. Аналізуй звернення клієнта.
Правила пріоритету:
- high: гроші списано без результату, загроза безпеці/здоровʼю, повна неможливість користуватись сервісом, сильне невдоволення з погрозою піти/скаргою.
- medium: затримка доставки, проблема, що має обхідний шлях, запит на повернення.
- low: загальні питання, побажання, подяки.
Підсумок — рівно одне речення українською.
Чернетка відповіді — ввічлива, конкретна, українською, звертайся до клієнта на імʼя, без вигаданих фактів (номерів замовлень, дат, сум).`;

export async function analyzeTicket(customerName: string, message: string): Promise<Analysis> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic();

  // Forced tool use makes the model return JSON matching the schema instead of free text.
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tool_choice: { type: "tool", name: "save_analysis" },
    tools: [
      {
        name: "save_analysis",
        description: "Зберегти структурований аналіз звернення",
        input_schema: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["low", "medium", "high"] },
            category: { type: "string", enum: [...CATEGORIES] },
            summary: { type: "string", description: "Одне речення" },
            draft_reply: { type: "string", description: "Чернетка відповіді клієнту" },
          },
          required: ["priority", "category", "summary", "draft_reply"],
        },
      },
    ],
    messages: [{ role: "user", content: `Імʼя клієнта: ${customerName}\n\nЗвернення:\n${message}` }],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("LLM did not return structured output");
  return AnalysisSchema.parse(block.input);
}
