"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DICTS, LANG_COOKIE, LANGS, type Lang } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

// Each language is shown in its own name, so it is recognisable whatever the current UI language.
const NAMES: Record<Lang, string> = { uk: "Українська", en: "English" };

const GlobeIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function saveLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitch() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Lang) => {
    setOpen(false);
    if (next === lang) return;
    saveLang(next);
    // Server components read the cookie, so re-render them in the new language.
    startTransition(() => router.refresh());
    showToast(true, DICTS[next].langChanged);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="btn btn-secondary w-full justify-between py-2"
      >
        <span className="flex items-center gap-2">
          <GlobeIcon />
          {NAMES[lang]}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.language}
          className="dropup-in absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          {LANGS.map((l) => {
            const selected = l === lang;
            return (
              <li key={l} role="option" aria-selected={selected}>
                <button
                  type="button"
                  lang={l}
                  onClick={() => choose(l)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected ? "bg-neutral-100 font-semibold dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <span className="w-4">{selected && <CheckIcon />}</span>
                  {NAMES[l]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
