import { listTickets } from "@/lib/db";
import TicketList from "./TicketList";
import { getDict } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [tickets, t] = await Promise.all([listTickets(), getDict()]);
  const analyzed = tickets.filter((t) => t.analyzed_at).length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          {t.ticketsTitle}
          <span className="badge badge-lg">{tickets.length}</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          {t.ticketsSubtitle(analyzed, tickets.length)}
        </p>
      </header>
      <TicketList tickets={tickets} />
    </div>
  );
}
