"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Toast from "./Toast";

// After the form redirects here with ?added=<id>: confirm, scroll smoothly to the new ticket
// and outline it for a moment, then clean the URL.
export default function AddedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const added = params.get("added");

  useEffect(() => {
    if (!added) return;
    const show = setTimeout(() => setVisible(true), 0);
    const card = document.getElementById(`ticket-${added}`);
    const scroll = setTimeout(() => {
      card?.scrollIntoView({ behavior: "smooth", block: "start" });
      card?.classList.add("ticket-highlight");
    }, 150);
    const unmark = setTimeout(() => card?.classList.remove("ticket-highlight"), 4000);
    router.replace(pathname, { scroll: false });
    const hide = setTimeout(() => setVisible(false), 3500);
    return () => [show, scroll, unmark, hide].forEach(clearTimeout);
  }, [added, pathname, router]);

  if (!visible) return null;
  return <Toast ok text="Звернення збережено" />;
}
