"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Toast from "./Toast";

// Shows a confirmation after the form redirects here with ?added=1, then cleans the URL.
export default function AddedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const added = params.get("added") === "1";

  useEffect(() => {
    if (!added) return;
    const show = setTimeout(() => setVisible(true), 0);
    router.replace(pathname, { scroll: false });
    const hide = setTimeout(() => setVisible(false), 3500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [added, pathname, router]);

  if (!visible) return null;
  return <Toast ok text="Звернення збережено" />;
}
