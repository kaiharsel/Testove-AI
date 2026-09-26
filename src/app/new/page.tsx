import { listNewTickets } from "@/lib/db";
import TicketForm from "../TicketForm";
import TicketCard from "../TicketCard";
import AddedToast from "../AddedToast";

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Збережіть звернення", text: "Воно зʼявиться нижче та у списку звернень" },
  { title: "Запустіть AI-аналіз", text: "Кнопка «Аналізувати (AI)» на картці звернення" },
  { title: "Отримайте результат", text: "Пріоритет, категорія, підсумок і чернетка відповіді" },
];

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

      <ol className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
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
