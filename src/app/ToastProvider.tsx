"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Toast from "./Toast";

type ToastData = { id: number; ok: boolean; text: string };

const ToastContext = createContext<(ok: boolean, text: string) => void>(() => {});

// One toast slot for the whole app, so a message survives its source unmounting
// (e.g. "deleted" after the card is gone). A new toast replaces the current one.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const show = useCallback((ok: boolean, text: string) => setToast({ id: Date.now(), ok, text }), []);
  const hide = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && <Toast key={toast.id} ok={toast.ok} text={toast.text} onDone={hide} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
