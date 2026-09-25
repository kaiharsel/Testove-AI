"use server";

import { revalidatePath } from "next/cache";
import { createTicket, getTicket, saveAnalysis } from "@/lib/db";
import { analyzeTicket } from "@/lib/analyze";

export type ActionState = { error?: string; ok?: boolean };

export async function addTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("customer_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !message) return { error: "Заповніть імʼя та текст звернення" };
  if (name.length > 200 || message.length > 5000) return { error: "Занадто довгий текст" };
  try {
    await createTicket(name, message);
  } catch (e) {
    console.error(e);
    return { error: "Не вдалося зберегти звернення" };
  }
  revalidatePath("/");
  return { ok: true };
}

export async function analyzeTicketAction(id: number): Promise<ActionState> {
  try {
    const ticket = await getTicket(id);
    if (!ticket) return { error: "Звернення не знайдено" };
    const analysis = await analyzeTicket(ticket.customer_name, ticket.message);
    await saveAnalysis(id, analysis);
  } catch (e) {
    console.error(e);
    return { error: "Помилка AI-аналізу. Спробуйте ще раз." };
  }
  revalidatePath("/");
  return { ok: true };
}
