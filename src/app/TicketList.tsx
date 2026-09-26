"use client";

import { useState } from "react";
import type { Ticket } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import TicketCard from "./TicketCard";

const NOT_ANALYZED = "без аналізу";
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [selected, setCategory] = useState<string | null>(null);
  const [byPriority, setByPriority] = useState(false);

  const count = (c: string) =>
    tickets.filter((t) => (c === NOT_ANALYZED ? !t.category : t.category === c)).length;
  const filters = [...CATEGORIES, NOT_ANALYZED].filter((c) => count(c) > 0);
  const category = selected && filters.includes(selected) ? selected : null;

  let visible = category
    ? tickets.filter((t) => (category === NOT_ANALYZED ? !t.category : t.category === category))
    : tickets;
  if (byPriority) {
    visible = [...visible].sort(
      (a, b) => (a.priority ? PRIORITY_ORDER[a.priority] : 3) - (b.priority ? PRIORITY_ORDER[b.priority] : 3),
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Звернення ({visible.length})</h2>
        {tickets.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            <select
              aria-label="Категорія"
              className="select"
              value={category ?? ""}
              onChange={(e) => setCategory(e.target.value || null)}
            >
              <option value="">Усі категорії ({tickets.length})</option>
              {filters.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)} ({count(c)})
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={byPriority}
                onChange={(e) => setByPriority(e.target.checked)}
              />
              <span className="switch-track" aria-hidden="true" />
              Спочатку важливі
            </label>
          </div>
        )}
      </div>

      {tickets.length === 0 && <p className="text-neutral-500 dark:text-neutral-400">Поки що звернень немає.</p>}
      {visible.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </section>
  );
}
