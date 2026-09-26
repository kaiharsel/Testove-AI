"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addTicketAction, type ActionState } from "./actions";

const MAX_MESSAGE = 5000;

export default function TicketForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTicketAction, {});
  const [length, setLength] = useState(0);

  return (
    <form action={action} className="card">
      <div className="space-y-8 p-6 md:p-10">
        <div className="space-y-3">
          <div>
            <label htmlFor="customer_name" className="block font-medium">
              Імʼя клієнта
            </label>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Як звертатися до клієнта у відповіді.</p>
          </div>
          <input
            id="customer_name"
            name="customer_name"
            placeholder="Напр. Олена Коваль"
            autoComplete="off"
            required
            maxLength={200}
            className="field"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="message" className="block font-medium">
              Текст звернення
            </label>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Скопіюйте повідомлення клієнта повністю: AI визначить пріоритет і категорію.
            </p>
          </div>
          <textarea
            id="message"
            name="message"
            placeholder="Опишіть проблему або питання клієнта"
            required
            rows={8}
            maxLength={MAX_MESSAGE}
            onChange={(e) => setLength(e.target.value.length)}
            className="field resize-y leading-relaxed"
          />
          <div className="text-right text-xs text-neutral-400 tabular-nums dark:text-neutral-500">
            {length} / {MAX_MESSAGE}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-neutral-200 px-6 py-5 md:px-10 dark:border-neutral-800">
        {state.error && <span className="mr-auto text-sm text-red-600 dark:text-red-400">{state.error}</span>}
        <Link href="/" className="btn btn-secondary">
          Скасувати
        </Link>
        <button disabled={pending} className="btn btn-primary px-6">
          {pending ? "Збереження…" : "Зберегти звернення"}
        </button>
      </div>
    </form>
  );
}
