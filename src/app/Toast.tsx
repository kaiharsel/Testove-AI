const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M5 10.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <path d="M10 6v5M10 14h.01" strokeLinecap="round" />
  </svg>
);

export default function Toast({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      role="status"
      className="toast-in fixed top-5 left-1/2 z-50 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white py-3 pr-5 pl-3 text-sm font-medium shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          ok
            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
        }`}
      >
        {ok ? <CheckIcon /> : <AlertIcon />}
      </span>
      {text}
    </div>
  );
}
