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
    <form ref={formRef} action={action} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Нове звернення</h2>
      <input
        name="customer_name"
        placeholder="Імʼя клієнта"
        required
        maxLength={200}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
      />
      <textarea
        name="message"
        placeholder="Текст звернення"
        required
        rows={4}
        maxLength={5000}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Збереження…" : "Додати"}
        </button>
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
