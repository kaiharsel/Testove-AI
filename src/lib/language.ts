import type { Lang } from "./i18n";

// Instant, offline detection so every ticket has a language badge before any AI call:
// whichever script (Cyrillic vs Latin) has more letters wins.
export function detectLanguage(text: string): Lang {
  const cyrillic = text.match(/\p{Script=Cyrillic}/gu)?.length ?? 0;
  const latin = text.match(/\p{Script=Latin}/gu)?.length ?? 0;
  return cyrillic >= latin ? "uk" : "en";
}

// Tickets are translated into the other supported language.
export const translationTarget = (lang: Lang): Lang => (lang === "uk" ? "en" : "uk");
