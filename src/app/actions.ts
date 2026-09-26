"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTicket, deleteTicket, getTicket, saveAnalysis } from "@/lib/db";
import { analyzeTicket } from "@/lib/analyze";
import { getLang } from "@/lib/i18n-server";
import type { ErrorKey } from "@/lib/i18n";

// Errors are dictionary keys; the client shows them in the current language.
export type ActionState = { error?: ErrorKey; ok?: boolean };

export async function addTicketAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("customer_name") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !message) return { error: "required" };
  if (name.length > 200 || message.length > 5000) return { error: "tooLong" };
  let id: number;
  try {
    id = (await createTicket(name, message)).id;
  } catch (e) {
    console.error(e);
    return { error: "saveFailed" };
  }
  revalidatePath("/", "layout");
  redirect(`/new?added=${id}`);
}

export async function analyzeTicketAction(id: number): Promise<ActionState> {
  try {
    const ticket = await getTicket(id);
    if (!ticket) return { error: "notFound" };
    const analysis = await analyzeTicket(ticket.customer_name, ticket.message, await getLang());
    await saveAnalysis(id, analysis);
  } catch (e) {
    console.error(e);
    return { error: "analyzeFailed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTicketAction(id: number): Promise<ActionState> {
  try {
    await deleteTicket(id);
  } catch (e) {
    console.error(e);
    return { error: "deleteFailed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
