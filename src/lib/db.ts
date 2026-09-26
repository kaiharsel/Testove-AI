import { neon } from "@neondatabase/serverless";
import type { Lang } from "./i18n";
import { detectLanguage } from "./language";

// Tickets younger than this get the "Нове" badge and show under the new-ticket form.
const NEW_TICKET_INTERVAL = "1 hour";

type Priority = "low" | "medium" | "high";

export type Ticket = {
  id: number;
  customer_name: string;
  message: string;
  created_at: string;
  priority: Priority | null;
  category: string | null;
  summary: string | null;
  draft_reply: string | null;
  analyzed_at: string | null;
  language: Lang | null;
  /** The message translated into the other language; filled by AI analysis. */
  translation: string | null;
  /** Created within NEW_TICKET_INTERVAL; only set by list queries. */
  is_new?: boolean;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let schemaReady: Promise<unknown> | null = null;

async function migrate() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      priority TEXT,
      category TEXT,
      summary TEXT,
      draft_reply TEXT,
      analyzed_at TIMESTAMPTZ
    )`;
  // Columns added later; backfill language for tickets created before language detection existed.
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS language TEXT`;
  await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS translation TEXT`;
  await sql`UPDATE tickets SET language = CASE WHEN message ~ '[А-Яа-яІіЇїЄєҐґ]' THEN 'uk' ELSE 'en' END
    WHERE language IS NULL`;
}

async function ensureSchema() {
  schemaReady ??= migrate().catch((e) => {
    schemaReady = null;
    throw e;
  });
  await schemaReady;
}

export async function listTickets(): Promise<Ticket[]> {
  await ensureSchema();
  return (await getSql()`
    SELECT *, created_at > now() - ${NEW_TICKET_INTERVAL}::interval AS is_new
    FROM tickets ORDER BY created_at DESC`) as Ticket[];
}

export async function listNewTickets(): Promise<Ticket[]> {
  await ensureSchema();
  return (await getSql()`
    SELECT *, true AS is_new FROM tickets
    WHERE created_at > now() - ${NEW_TICKET_INTERVAL}::interval
    ORDER BY created_at DESC`) as Ticket[];
}

export async function getTicket(id: number): Promise<Ticket | null> {
  await ensureSchema();
  const rows = (await getSql()`SELECT * FROM tickets WHERE id = ${id}`) as Ticket[];
  return rows[0] ?? null;
}

export async function createTicket(customerName: string, message: string): Promise<Ticket> {
  await ensureSchema();
  const rows = (await getSql()`
    INSERT INTO tickets (customer_name, message, language)
    VALUES (${customerName}, ${message}, ${detectLanguage(message)})
    RETURNING *`) as Ticket[];
  return rows[0];
}

export async function saveAnalysis(
  id: number,
  a: { priority: Priority; category: string; summary: string; draft_reply: string; translation: string },
): Promise<Ticket> {
  const rows = (await getSql()`
    UPDATE tickets SET
      priority = ${a.priority}, category = ${a.category},
      summary = ${a.summary}, draft_reply = ${a.draft_reply}, translation = ${a.translation},
      analyzed_at = now()
    WHERE id = ${id}
    RETURNING *`) as Ticket[];
  return rows[0];
}

export async function deleteTicket(id: number): Promise<void> {
  await getSql()`DELETE FROM tickets WHERE id = ${id}`;
}

export async function countTickets(): Promise<number> {
  await ensureSchema();
  const rows = (await getSql()`SELECT count(*)::int AS n FROM tickets`) as { n: number }[];
  return rows[0].n;
}
