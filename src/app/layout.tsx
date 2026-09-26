import type { Metadata } from "next";
import { cookies } from "next/headers";
import { countTickets } from "@/lib/db";
import { getDict, getLang } from "@/lib/i18n-server";
import { THEME_COOKIE, isTheme } from "@/lib/theme";
import { I18nProvider } from "./I18nProvider";
import { ToastProvider } from "./ToastProvider";
import Sidebar from "./Sidebar";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.appName, description: t.metaDescription };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [count, lang, cookieStore] = await Promise.all([countTickets(), getLang(), cookies()]);
  const theme = cookieStore.get(THEME_COOKIE)?.value;

  return (
    <html lang={lang} className={isTheme(theme) ? theme : undefined}>
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
