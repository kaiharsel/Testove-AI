"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTicketAction, type ActionState } from "./actions";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

const MAX_MESSAGE = 5000;

export default function TicketForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTicketAction, {});
  const [length, setLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useI18n();
  const showToast = useToast();

  // After a successful save the page stays here; clear the form for the next ticket.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state]);

  useEffect(() => {
    if (state.error) showToast(false, t.errors[state.error]);
  }, [state, showToast, t]);

  return (
    <form ref={formRef} action={action} onReset={() => setLength(0)} className="card">
      <div className="space-y-8 p-6 md:p-10">
        <div className="space-y-3">
          <div>
            <label htmlFor="customer_name" className="block font-medium">
              {t.nameLabel}
            </label>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.nameHint}</p>
          </div>
          <input
            id="customer_name"
            name="customer_name"
            placeholder={t.namePlaceholder}
            autoComplete="off"
            required
            maxLength={200}
            className="field"
          />
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="message" className="block font-medium">
              {t.messageLabel}
            </label>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t.messageHint}
            </p>
          </div>
          <textarea
            id="message"
            name="message"
            placeholder={t.messagePlaceholder}
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
        {state.error && <span className="mr-auto text-sm text-red-600 dark:text-red-400">{t.errors[state.error]}</span>}
        <button disabled={pending} className="btn btn-primary px-6">
          {pending ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}
