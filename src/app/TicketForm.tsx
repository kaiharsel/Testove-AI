"use client";

import { useActionState } from "react";
import { addTicketAction, type ActionState } from "./actions";

export default function TicketForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTicketAction, {});

  return (
    <form action={action} className="card space-y-6 p-6 md:p-8">
      <div className="space-y-2">
        <label htmlFor="customer_name" className="field-label">
          Імʼя клієнта
        </label>
        <input id="customer_name" name="customer_name" placeholder="Напр. Олена Коваль" autoComplete="off" required maxLength={200} className="field" />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="field-label">
          Текст звернення
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Опишіть проблему або питання клієнта"
          required
          rows={6}
          maxLength={5000}
          className="field resize-y"
        />
      </div>
      <div className="flex items-center gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button disabled={pending} className="btn btn-primary px-6">
          {pending ? "Збереження…" : "Зберегти звернення"}
        </button>
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
