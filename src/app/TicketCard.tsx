"use client";

import { useEffect, useState, useTransition } from "react";
import type { Ticket } from "@/lib/db";
import { analyzeTicketAction, deleteTicketAction } from "./actions";
import type { ErrorKey } from "@/lib/i18n";
import { translationTarget } from "@/lib/language";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

const PRIORITY_CLS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
} as const;

const GlobeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5" aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5z" />
  </svg>
);

const TranslateIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
    <path d="M3 5h8M7 3v2M5 5c0 3 2 5.5 5 6.5M9 5c0 3-2.5 6-6 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 17l3.25-7.5L17 17M11.6 14.5h4.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  const [showTranslation, setShowTranslation] = useState(false);
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

  // The LLM gives no real progress, so estimate it: reach ~90% within ~1.5s, hold near 95%, jump to 100% when done.
  useEffect(() => {
    if (!pending) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const seconds = (Date.now() - started) / 1000;
      setProgress(Math.min(95, Math.round(95 * (1 - Math.exp(-seconds / 0.6)))));
    }, 100);
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
            {ticket.language && (
              <span className="lang-badge">
                <GlobeIcon />
                {t.ticketLang[ticket.language]}
              </span>
            )}
            {ticket.is_new && <span className="new-badge">{t.newBadge}</span>}
          </div>
          <time className="pt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {new Date(ticket.created_at).toLocaleString(t.locale, { dateStyle: "medium", timeStyle: "short" })}
          </time>
        </header>
        <p lang={ticket.language ?? undefined} className="leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
          {ticket.message}
        </p>

        {ticket.translation && ticket.language && (
          <div className="space-y-3">
            <button
              onClick={() => setShowTranslation((v) => !v)}
              aria-expanded={showTranslation}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <TranslateIcon />
              {showTranslation ? t.hideTranslation : t.showTranslation(translationTarget(ticket.language))}
            </button>
            {showTranslation && (
              <p
                lang={translationTarget(ticket.language)}
                className="dropdown-in border-l-2 border-neutral-300 pl-4 leading-relaxed whitespace-pre-wrap text-neutral-600 italic dark:border-neutral-700 dark:text-neutral-400"
              >
                {ticket.translation}
              </p>
            )}
          </div>
        )}

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
