"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Toast from "./Toast";

// After the form redirects here with ?added=<id>: confirm, scroll smoothly to the new ticket
// and outline it for a moment, then clean the URL.
export default function AddedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const hideToast = useCallback(() => setToastVisible(false), []);
  const added = params.get("added");

  // Take the id from the URL once and clean it. Timers live in the effect below, keyed by the
  // id, so removing ?added from the URL does not cancel them (that left the toast stuck before).
  useEffect(() => {
    if (!added) return;
    const take = setTimeout(() => setAddedId(added), 0);
    router.replace(pathname, { scroll: false });
    return () => clearTimeout(take);
  }, [added, pathname, router]);

  useEffect(() => {
    if (!addedId) return;
    const card = document.getElementById(`ticket-${addedId}`);
    const scroll = setTimeout(() => {
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
      card?.classList.add("ticket-highlight");
    }, 150);
    const unmark = setTimeout(() => card?.classList.remove("ticket-highlight"), 4200);
    const show = setTimeout(() => setToastVisible(true), 0);
    return () => {
      [scroll, unmark, show].forEach(clearTimeout);
      card?.classList.remove("ticket-highlight");
    };
  }, [addedId]);

  if (!toastVisible) return null;
  return <Toast ok text="Звернення збережено" onDone={hideToast} />;
}
