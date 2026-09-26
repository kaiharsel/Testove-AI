"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTicketAction, type ActionState } from "./actions";

export default function TicketForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTicketAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-lg font-semibold">Нове звернення</h2>
      <input
        name="customer_name"
        placeholder="Імʼя клієнта"
        required
        maxLength={200}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none transition-colors focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-400 dark:bg-black dark:placeholder-neutral-500"
      />
      <textarea
        name="message"
        placeholder="Текст звернення"
        required
        rows={4}
        maxLength={5000}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none transition-colors focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-400 dark:bg-black dark:placeholder-neutral-500"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Збереження…" : "Додати"}
        </button>
        {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
