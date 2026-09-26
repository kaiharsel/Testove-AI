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
      className="btn btn-secondary shrink-0 py-1.5"
    >
      <span className="dark:hidden">🌙 Темна</span>
      <span className="hidden dark:inline">☀️ Світла</span>
    </button>
  );
}
