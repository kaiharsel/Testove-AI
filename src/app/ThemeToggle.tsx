"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  };

  // The label switches via the `dark` class, so it is correct on first paint without client state.
  return (
    <button
      onClick={toggle}
      aria-label="Перемкнути тему"
      className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      <span className="dark:hidden">🌙 Темна</span>
      <span className="hidden dark:inline">☀️ Світла</span>
    </button>
  );
}
