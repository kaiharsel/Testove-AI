// Explicit theme choice, stored in a cookie so the server renders it on <html> (no flash, and
// React hydration keeps it). No cookie means "follow the system", handled in CSS.
export const THEME_COOKIE = "theme";
export type Theme = "light" | "dark";
export const isTheme = (v: unknown): v is Theme => v === "light" || v === "dark";
