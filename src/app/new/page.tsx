import TicketForm from "../TicketForm";

export default function NewTicketPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Нове звернення</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Внесіть звернення клієнта. Після збереження його можна проаналізувати за допомогою AI.
        </p>
      </header>
      <TicketForm />
    </div>
  );
}
