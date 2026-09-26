import { listNewTickets } from "@/lib/db";
import TicketForm from "../TicketForm";
import TicketCard from "../TicketCard";
import AddedToast from "../AddedToast";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const recent = await listNewTickets();

  return (
    <div className="space-y-12">
      <AddedToast />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Нове звернення</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Внесіть звернення клієнта, щоб проаналізувати його за допомогою AI</p>
      </header>

      <TicketForm />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            Нові звернення
            <span className="badge">{recent.length}</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Створені за останню годину</p>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Тут зʼявляться звернення, які ви щойно створили
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
