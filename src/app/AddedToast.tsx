"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  return (
    <div
      role="status"
      className="toast-in fixed top-4 left-1/2 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      ✓ Звернення збережено
    </div>
  );
}
