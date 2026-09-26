import { listNewTickets } from "@/lib/db";
import TicketForm from "../TicketForm";
import TicketCard from "../TicketCard";
import AddedToast from "../AddedToast";
import { getDict } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const [recent, t] = await Promise.all([listNewTickets(), getDict()]);

  return (
    <div className="space-y-12">
      <AddedToast />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t.newTitle}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">{t.newSubtitle}</p>
      </header>

      <ol className="grid gap-6 sm:grid-cols-3">
        {t.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 sm:flex-col sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-sm font-semibold dark:border-neutral-700">
              {i + 1}
            </span>
            <div className="space-y-1">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">{step.text}</div>
            </div>
          </li>
        ))}
      </ol>

      <TicketForm />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            {t.recentTitle}
            <span className="badge">{recent.length}</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.recentSubtitle}</p>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {t.recentEmpty}
          </div>
        ) : (
          <div className="space-y-5">
            {recent.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
