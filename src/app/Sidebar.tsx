"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitch from "./LanguageSwitch";
import { useI18n } from "./I18nProvider";

const ListIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
    <path d="M3.5 5h13M3.5 10h13M3.5 15h13" strokeLinecap="round" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
    <path d="M10 4v12M4 10h12" strokeLinecap="round" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
    <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
  </svg>
);

function Brand() {
  const { t } = useI18n();
  return (
    <div>
      <div className="text-base font-bold tracking-tight">{t.appName}</div>
      <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.appTagline}</div>
    </div>
  );
}

function Nav({ count, onNavigate }: { count: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = [
    { href: "/", label: t.navTickets, icon: <ListIcon />, badge: count },
    { href: "/new", label: t.navNew, icon: <PlusIcon /> },
  ];

  return (
    <nav className="flex flex-col">
      {items.map((item, i) => {
        const active = pathname === item.href;
        return (
          <div key={item.href}>
            {/* Faint divider with breathing room between sections */}
            {i > 0 && <div className="mx-3 my-3 h-px bg-neutral-900/10 dark:bg-white/10" aria-hidden="true" />}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && <span className={`badge ${active ? "badge-inverted" : ""}`}>{item.badge}</span>}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-8 md:flex dark:border-neutral-800 dark:bg-neutral-950">
        <div className="px-2 pb-8">
          <Brand />
        </div>
        <Nav count={count} />
        <div className="mt-auto space-y-2">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar with burger */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-5 py-3 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="text-base font-bold tracking-tight">{t.appName}</div>
        <button
          onClick={() => setOpen(true)}
          aria-label={t.openMenu}
          aria-expanded={open}
          className="btn btn-secondary h-10 w-10 p-0"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fade-in absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            className="drawer-in absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white px-4 py-6 shadow-xl dark:bg-neutral-950"
          >
            <div className="flex items-start justify-between gap-4 px-2 pb-8">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label={t.closeMenu} className="btn btn-secondary h-10 w-10 p-0">
                <CloseIcon />
              </button>
            </div>
            <Nav count={count} onNavigate={() => setOpen(false)} />
            <div className="mt-auto space-y-2">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
