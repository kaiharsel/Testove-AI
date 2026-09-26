import type { Metadata } from "next";
import { countTickets } from "@/lib/db";
import { getDict, getLang } from "@/lib/i18n-server";
import { I18nProvider } from "./I18nProvider";
import { ToastProvider } from "./ToastProvider";
import Sidebar from "./Sidebar";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appName, description: t.metaDescription };
}

export const dynamic = "force-dynamic";

// Applies the saved (or system) theme before first paint to avoid a light flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [count, lang] = await Promise.all([countTickets(), getLang()]);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-neutral-100 text-neutral-900 antialiased md:flex dark:bg-black dark:text-neutral-100">
        <I18nProvider lang={lang}>
          <ToastProvider>
            <Sidebar count={count} />
            <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 md:px-10 md:py-14">{children}</main>
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
