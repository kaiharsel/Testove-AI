"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DICTS, LANG_COOKIE, LANGS } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

const LABELS = { uk: "UA", en: "EN" } as const;

function saveLang(lang: string) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageSwitch() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  const choose = (next: (typeof LANGS)[number]) => {
    if (next === lang) return;
    saveLang(next);
    // Server components read the cookie, so re-render them in the new language.
    startTransition(() => router.refresh());
    showToast(true, DICTS[next].langChanged);
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.language}
      className={`grid grid-cols-2 gap-1 rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900 ${
        pending ? "opacity-60" : ""
      }`}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={l === lang}
          onClick={() => choose(l)}
          className={`cursor-pointer rounded-md py-1.5 text-sm font-semibold transition-colors ${
            l === lang
              ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
