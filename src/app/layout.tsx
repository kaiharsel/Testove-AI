import type { Metadata } from "next";
import { countTickets } from "@/lib/db";
import Sidebar from "./Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-обробка звернень",
  description: "Внутрішній інструмент служби підтримки з AI-аналізом звернень",
};

export const dynamic = "force-dynamic";

// Applies the saved (or system) theme before first paint to avoid a light flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const count = await countTickets();

  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-neutral-100 text-neutral-900 antialiased md:flex dark:bg-black dark:text-neutral-100">
        <Sidebar count={count} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 md:px-10 md:py-14">{children}</main>
      </body>
    </html>
  );
}
