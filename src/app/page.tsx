import { listTickets } from "@/lib/db";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import ThemeToggle from "./ThemeToggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tickets = await listTickets();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI-обробка звернень</h1>
          <p className="text-slate-600 dark:text-slate-400">Додайте звернення клієнта та отримайте AI-аналіз.</p>
        </div>
        <ThemeToggle />
      </header>
      <TicketForm />
      <TicketList tickets={tickets} />
    </main>
  );
}
