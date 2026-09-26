"use client";

import { useEffect, useState, useTransition } from "react";
import type { Ticket } from "@/lib/db";
import { analyzeTicketAction, deleteTicketAction } from "./actions";
import type { ErrorKey } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

const PRIORITY_CLS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
} as const;

const CopyIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
  </svg>
);

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<ErrorKey>();
  const { t } = useI18n();
  const showToast = useToast();
  const [progress, setProgress] = useState(0);
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
        showToast(false, t.errors[res.error]);
      } else {
        showToast(true, t.deleted(ticket.customer_name));
      }
    });

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
      showToast(!res.error, res.error ? t.analyzeFailed(ticket.customer_name) : t.analyzeDone(ticket.customer_name));
    });

  const copyDraft = async () => {
    const text = ticket.draft_reply ?? "";
    try {
      await navigator.clipboard.writeText(text);
      showToast(true, t.copied);
    } catch {
      // Clipboard API can be unavailable (non-secure origin, no focus): fall back to execCommand.
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      showToast(ok, ok ? t.copied : t.copyFailed);
    }
  };

  return (
    <article id={`ticket-${ticket.id}`} className="card overflow-hidden scroll-mt-8">
      <div className="space-y-4 p-6">
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{ticket.customer_name}</h3>
            {ticket.is_new && <span className="new-badge">{t.newBadge}</span>}
          </div>
          <time className="pt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {new Date(ticket.created_at).toLocaleString(t.locale, { dateStyle: "medium", timeStyle: "short" })}
          </time>
        </header>
        <p className="leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{ticket.message}</p>

        {analyzed && ticket.priority && (
          <div className="space-y-5 rounded-xl bg-neutral-50 p-5 dark:bg-black/40">
            <div className="flex flex-wrap gap-6">
              <div className="space-y-1.5">
                <div className="field-label">{t.priority}</div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${PRIORITY_CLS[ticket.priority]}`}>
                  {t.priorities[ticket.priority]}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="field-label">{t.category}</div>
                <span className="inline-block rounded-full bg-neutral-200 px-2.5 py-0.5 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  {t.categories[ticket.category ?? ""] ?? ticket.category}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="field-label">{t.summary}</div>
              <p className="text-sm leading-relaxed">{ticket.summary?.replace(/\.\s*$/, "")}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="field-label">{t.draftReply}</div>
                <button onClick={copyDraft} className="btn btn-secondary px-2.5 py-1 text-xs">
                  <CopyIcon />
                  {t.copy}
                </button>
              </div>
              <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap dark:border-neutral-800 dark:bg-neutral-900">
                {ticket.draft_reply}
              </p>
            </div>
          </div>
        )}

        {pending && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>{t.analyzing}</span>
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
          {pending ? t.analyzingShort : analyzed ? t.reanalyze : t.analyze}
        </button>
        {error && <span className="text-sm text-red-600 dark:text-red-400">{t.errors[error]}</span>}
        <button onClick={() => setConfirmDelete(true)} disabled={pending || deleting} className="btn btn-danger ml-auto">
          {t.delete}
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
              {t.deleteTitle}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t.deleteText(ticket.customer_name).before}
              <b>{ticket.customer_name}</b>
              {t.deleteText(ticket.customer_name).after}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button autoFocus onClick={() => setConfirmDelete(false)} disabled={deleting} className="btn btn-secondary">
                {t.cancel}
              </button>
              <button onClick={remove} disabled={deleting} className="btn btn-danger-solid">
                {deleting ? t.deleting : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
