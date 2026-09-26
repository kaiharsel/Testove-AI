import TicketForm from "../TicketForm";

const STEPS = [
  { title: "Збережіть звернення", text: "Воно зʼявиться у списку звернень." },
  { title: "Запустіть AI-аналіз", text: "Кнопка «Аналізувати (AI)» на картці звернення." },
  { title: "Отримайте результат", text: "Пріоритет, категорія, підсумок і чернетка відповіді." },
];

export default function NewTicketPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Нове звернення</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Внесіть звернення клієнта, щоб проаналізувати його за допомогою AI.</p>
      </header>

      <TicketForm />

      <ol className="grid gap-4 sm:grid-cols-3">
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
    </div>
  );
}
