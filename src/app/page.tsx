import { listTickets } from "@/lib/db";
import TicketList from "./TicketList";
import AddedToast from "./AddedToast";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tickets = await listTickets();
  const analyzed = tickets.filter((t) => t.analyzed_at).length;

  return (
    <div className="space-y-8">
      <AddedToast />
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          Звернення
          <span className="badge badge-lg">{tickets.length}</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Проаналізовано {analyzed} з {tickets.length}. Натисніть «Аналізувати (AI)», щоб отримати пріоритет, категорію та
          чернетку відповіді.
        </p>
      </header>
      <TicketList tickets={tickets} />
    </div>
  );
}
