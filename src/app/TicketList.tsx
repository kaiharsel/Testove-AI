"use client";

import { useState } from "react";
import Link from "next/link";
import type { Ticket } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import TicketCard from "./TicketCard";
import CategorySelect from "./CategorySelect";

const NOT_ANALYZED = "без аналізу";
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [selected, setCategory] = useState<string | null>(null);
  const [byPriority, setByPriority] = useState(false);

  const matches = (t: Ticket, c: string) => (c === NOT_ANALYZED ? !t.category : t.category === c);
  const count = (c: string) => tickets.filter((t) => matches(t, c)).length;
  const filters = [...CATEGORIES, NOT_ANALYZED].filter((c) => count(c) > 0);
  // If the selected category disappears (e.g. after delete), fall back to all.
  const category = selected && filters.includes(selected) ? selected : null;

  let visible = category ? tickets.filter((t) => matches(t, category)) : tickets;
  if (byPriority) {
    visible = [...visible].sort(
      (a, b) => (a.priority ? PRIORITY_ORDER[a.priority] : 3) - (b.priority ? PRIORITY_ORDER[b.priority] : 3),
    );
  }

  const options = [
    { value: null, label: "Усі категорії", count: tickets.length },
    ...filters.map((c) => ({ value: c, label: capitalize(c), count: count(c) })),
  ];

  if (tickets.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="text-neutral-500 dark:text-neutral-400">Поки що звернень немає</p>
        <Link href="/new" className="btn btn-primary">
          Додати перше звернення
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategorySelect options={options} value={category} onChange={setCategory} />
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium select-none">
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

      <div className="space-y-5">
        {visible.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </section>
  );
}
