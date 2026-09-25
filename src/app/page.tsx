import { listTickets } from "@/lib/db";
import TicketForm from "./TicketForm";
import TicketCard from "./TicketCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tickets = await listTickets();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold">AI-обробка звернень</h1>
        <p className="text-slate-600">Додайте звернення клієнта та отримайте AI-аналіз.</p>
      </header>
      <TicketForm />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Звернення ({tickets.length})</h2>
        {tickets.length === 0 && <p className="text-slate-500">Поки що звернень немає.</p>}
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </section>
    </main>
  );
}
