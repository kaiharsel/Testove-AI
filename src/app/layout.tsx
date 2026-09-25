import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-обробка звернень",
  description: "Внутрішній інструмент служби підтримки з AI-аналізом звернень",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
