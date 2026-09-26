"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

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

export default function Sidebar({ count }: { count: number }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Звернення", icon: <ListIcon />, badge: count },
    { href: "/new", label: "Нове звернення", icon: <PlusIcon /> },
  ];

  return (
    <aside className="border-b border-neutral-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-4 px-5 py-4 md:block md:px-6 md:py-8">
        <div>
          <div className="text-base font-bold tracking-tight">AI-обробка звернень</div>
          <div className="mt-1 hidden text-sm text-neutral-500 md:block dark:text-neutral-400">Служба підтримки</div>
        </div>
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex gap-1 px-3 pb-3 md:flex-col md:px-4 md:pb-0">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:flex-none ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`badge ${active ? "badge-inverted" : ""}`}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden px-4 py-6 md:block">
        <ThemeToggle />
      </div>
    </aside>
  );
}
