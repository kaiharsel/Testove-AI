"use client";

import { useEffect, useState, useTransition } from "react";
import type { Ticket } from "@/lib/db";
import { analyzeTicketAction, deleteTicketAction } from "./actions";
import Toast from "./Toast";

const PRIORITY = {
  low: { label: "Низький", cls: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
  medium: { label: "Середній", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" },
  high: { label: "Високий", cls: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
} as const;

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const analyzed = ticket.analyzed_at !== null;

  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !deleting && setConfirmDelete(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete, deleting]);

  const remove = () =>
    startDelete(async () => {
      const res = await deleteTicketAction(ticket.id);
      if (res.error) {
        setError(res.error);
        setConfirmDelete(false);
      }
    });

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
    <article className="card overflow-hidden">
      {toast && <Toast ok={toast.ok} text={toast.text} />}

      <div className="space-y-4 p-6">
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h3 className="text-lg font-semibold">{ticket.customer_name}</h3>
          <time className="pt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {new Date(ticket.created_at).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" })}
          </time>
        </header>
        <p className="leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{ticket.message}</p>

        {analyzed && ticket.priority && (
          <div className="space-y-5 rounded-xl bg-neutral-50 p-5 dark:bg-black/40">
            <div className="flex flex-wrap gap-6">
              <div className="space-y-1.5">
                <div className="field-label">Пріоритет</div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${PRIORITY[ticket.priority].cls}`}>
                  {PRIORITY[ticket.priority].label}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="field-label">Категорія</div>
                <span className="inline-block rounded-full bg-neutral-200 px-2.5 py-0.5 text-sm font-medium text-neutral-800 first-letter:uppercase dark:bg-neutral-800 dark:text-neutral-200">
                  {ticket.category}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="field-label">Підсумок</div>
              <p className="text-sm leading-relaxed">{ticket.summary}</p>
            </div>
            <div className="space-y-1.5">
              <div className="field-label">Чернетка відповіді</div>
              <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-neutral-800 dark:bg-neutral-900">
                {ticket.draft_reply}
              </p>
            </div>
          </div>
        )}

        {pending && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>AI аналізує звернення…</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-200 dark:bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-neutral-50/60 px-6 py-4 dark:border-neutral-800 dark:bg-black/20">
        <button onClick={analyze} disabled={pending} className="btn btn-secondary">
          {pending ? "Аналізую…" : analyzed ? "Переаналізувати (AI)" : "Аналізувати (AI)"}
        </button>
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
        <button onClick={() => setConfirmDelete(true)} disabled={pending || deleting} className="btn btn-danger ml-auto">
          Видалити
        </button>
      </footer>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${ticket.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h3 id={`delete-title-${ticket.id}`} className="text-lg font-semibold">
              Видалити звернення?
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Звернення від <b>{ticket.customer_name}</b> і його AI-аналіз буде видалено назавжди.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button autoFocus onClick={() => setConfirmDelete(false)} disabled={deleting} className="btn btn-secondary">
                Скасувати
              </button>
              <button onClick={remove} disabled={deleting} className="btn btn-danger-solid">
                {deleting ? "Видалення…" : "Видалити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
