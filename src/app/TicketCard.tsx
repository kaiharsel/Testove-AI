"use client";

import { useEffect, useState, useTransition } from "react";
import type { Ticket } from "@/lib/db";
import { analyzeTicketAction } from "./actions";

const PRIORITY = {
  low: { label: "Низький", cls: "bg-green-100 text-green-800" },
  medium: { label: "Середній", cls: "bg-amber-100 text-amber-800" },
  high: { label: "Високий", cls: "bg-red-100 text-red-800" },
} as const;

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const analyzed = ticket.analyzed_at !== null;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // The LLM gives no real progress, so estimate it: approach 95% over ~6s, jump to 100% when done.
  useEffect(() => {
    if (!pending) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const seconds = (Date.now() - started) / 1000;
      setProgress(Math.min(95, Math.round(95 * (1 - Math.exp(-seconds / 2)))));
    }, 200);
    return () => {
      clearInterval(timer);
      setProgress(100);
    };
  }, [pending]);

  const analyze = () =>
    startTransition(async () => {
      setError(undefined);
      setProgress(0);
      const res = await analyzeTicketAction(ticket.id);
      if (res.error) setError(res.error);
      setToast(
        res.error
          ? { ok: false, text: `Не вдалося проаналізувати звернення: ${ticket.customer_name}` }
          : { ok: true, text: `Аналіз завершено: ${ticket.customer_name}` },
      );
    });

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {toast && (
        <div
          role="status"
          className={`toast-in fixed left-1/2 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.ok ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.ok ? "✓ " : "✕ "}
          {toast.text}
        </div>
      )}
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{ticket.customer_name}</h3>
        <time className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString("uk-UA")}</time>
      </header>
      <p className="mt-2 whitespace-pre-wrap text-slate-700">{ticket.message}</p>

      {analyzed && ticket.priority && (
        <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY[ticket.priority].cls}`}>
              Пріоритет: {PRIORITY[ticket.priority].label}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-medium text-slate-800">
              Категорія: {ticket.category}
            </span>
          </div>
          <p>
            <b>Підсумок:</b> {ticket.summary}
          </p>
          <div>
            <b>Чернетка відповіді:</b>
            <p className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-white p-3">{ticket.draft_reply}</p>
          </div>
        </div>
      )}

      {pending && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span>AI аналізує звернення…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-900 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={analyze}
          disabled={pending}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
        >
          {pending ? "Аналізую…" : analyzed ? "Переаналізувати (AI)" : "Аналізувати (AI)"}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </article>
  );
}
