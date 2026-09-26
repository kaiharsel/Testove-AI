"use client";

import { useState } from "react";
import type { Ticket } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import TicketCard from "./TicketCard";

const NOT_ANALYZED = "без аналізу";
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [byPriority, setByPriority] = useState(false);

  const count = (c: string) =>
    tickets.filter((t) => (c === NOT_ANALYZED ? !t.category : t.category === c)).length;
  const filters = [...CATEGORIES, NOT_ANALYZED].filter((c) => count(c) > 0);

  let visible = category
    ? tickets.filter((t) => (category === NOT_ANALYZED ? !t.category : t.category === category))
    : tickets;
  if (byPriority) {
    visible = [...visible].sort(
      (a, b) => (a.priority ? PRIORITY_ORDER[a.priority] : 3) - (b.priority ? PRIORITY_ORDER[b.priority] : 3),
    );
  }

  const chip = (active: boolean) => `chip ${active ? "chip-active" : "chip-idle"}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Звернення ({visible.length})</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <input type="checkbox" className="h-4 w-4 accent-neutral-900 dark:accent-white" checked={byPriority} onChange={(e) => setByPriority(e.target.checked)} />
          Спочатку високий пріоритет
        </label>
      </div>

      {tickets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button className={chip(category === null)} onClick={() => setCategory(null)}>
            Усі ({tickets.length})
          </button>
          {filters.map((c) => (
            <button key={c} className={chip(category === c)} onClick={() => setCategory(c)}>
              {c} ({count(c)})
            </button>
          ))}
        </div>
      )}

      {tickets.length === 0 && <p className="text-neutral-500 dark:text-neutral-400">Поки що звернень немає.</p>}
      {visible.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </section>
  );
}
