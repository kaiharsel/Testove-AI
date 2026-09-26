"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string | null; label: string; count: number };

export default function CategorySelect({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary min-w-52 justify-between"
      >
        <span className="flex items-center gap-2">
          {current.label}
          <span className="badge">{current.count}</span>
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="dropdown-in absolute left-0 z-30 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          {options.map((o) => {
            const selected = o.value === current.value;
            return (
              <li key={o.value ?? "all"} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-neutral-100 font-semibold dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <span className="w-4">
                    {selected && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                        <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1">{o.label}</span>
                  <span className="badge">{o.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
