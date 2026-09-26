"use client";

import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
    <path d="M16.5 12.2A7 7 0 017.8 3.5a7 7 0 108.7 8.7z" strokeLinejoin="round" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4" aria-hidden="true">
    <circle cx="10" cy="10" r="3.5" />
    <path
      d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1"
      strokeLinecap="round"
    />
  </svg>
);

export default function ThemeToggle() {
  const { t } = useI18n();
  const showToast = useToast();
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    showToast(true, dark ? t.themeSetDark : t.themeSetLight);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  };

  // The label switches via the `dark` class, so it is correct on first paint without client state.
  return (
    <button onClick={toggle} aria-label={t.themeToggle} className="btn btn-secondary w-full py-2">
      <span className="flex items-center gap-2 dark:hidden">
        <MoonIcon />
        {t.themeDark}
      </span>
      <span className="hidden items-center gap-2 dark:flex">
        <SunIcon />
        {t.themeLight}
      </span>
    </button>
  );
}
