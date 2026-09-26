"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTicket, deleteTicket, getTicket, saveAnalysis } from "@/lib/db";
import { analyzeTicket } from "@/lib/analyze";

export type ActionState = { error?: string; ok?: boolean };

export async function addTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("customer_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !message) return { error: "Заповніть імʼя та текст звернення" };
  if (name.length > 200 || message.length > 5000) return { error: "Занадто довгий текст" };
  let id: number;
  try {
    id = (await createTicket(name, message)).id;
  } catch (e) {
    console.error(e);
    return { error: "Не вдалося зберегти звернення" };
  }
  revalidatePath("/", "layout");
  redirect(`/new?added=${id}`);
}

export async function analyzeTicketAction(id: number): Promise<ActionState> {
  try {
    const ticket = await getTicket(id);
    if (!ticket) return { error: "Звернення не знайдено" };
    const analysis = await analyzeTicket(ticket.customer_name, ticket.message);
    await saveAnalysis(id, analysis);
  } catch (e) {
    console.error(e);
    return { error: "Помилка AI-аналізу. Спробуйте ще раз" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTicketAction(id: number): Promise<ActionState> {
  try {
    await deleteTicket(id);
  } catch (e) {
    console.error(e);
    return { error: "Не вдалося видалити звернення" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
