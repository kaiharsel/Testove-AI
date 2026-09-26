"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { useToast } from "./ToastProvider";

// After the form redirects here with ?added=<id>: confirm, scroll smoothly to the new ticket
// and outline it for a moment, then clean the URL.
export default function AddedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const showToast = useToast();
  const [addedId, setAddedId] = useState<string | null>(null);
  const added = params.get("added");

  // Take the id from the URL once and clean it. Timers live in the effect below, keyed by the
  // id, so removing ?added from the URL does not cancel them.
  useEffect(() => {
    if (!added) return;
    const take = setTimeout(() => setAddedId(added), 0);
    router.replace(pathname, { scroll: false });
    return () => clearTimeout(take);
  }, [added, pathname, router]);

  useEffect(() => {
    if (!addedId) return;
    showToast(true, t.saved);
    const card = document.getElementById(`ticket-${addedId}`);
    const scroll = setTimeout(() => {
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
      card?.classList.add("ticket-highlight");
    }, 150);
    const unmark = setTimeout(() => card?.classList.remove("ticket-highlight"), 4200);
    return () => {
      [scroll, unmark].forEach(clearTimeout);
      card?.classList.remove("ticket-highlight");
    };
    // Runs once per new ticket id; t/showToast are stable for that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedId]);

  return null;
}
