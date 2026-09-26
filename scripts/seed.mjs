// Adds example support tickets. Usage: npm run seed (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";

const EXAMPLES = [
  ["uk", "Ірина Коваль", "Замовлення №4471 мало прийти ще в понеділок, а трекінг Нової пошти досі показує «очікує відправлення». Коли відправите?"],
  ["uk", "Максим Бондар", "Карта двічі списала 1 249 грн за одне замовлення. Прошу терміново повернути зайве списання!"],
  ["uk", "Світлана Мельник", "Отримала навушники, лівий не працює взагалі. Хочу повернути товар і отримати гроші назад."],
  ["uk", "Олег Шевчук", "Не можу увійти в особистий кабінет — після введення пароля сторінка просто перезавантажується. Пробував у Chrome і Safari."],
  ["uk", "Наталія Ткаченко", "Кур'єр нагрубив і кинув посилку біля дверей, коробка пом'ята. Дуже неприємно, більше у вас не замовлятиму."],
  ["uk", "Андрій Лисенко", "Підкажіть, будь ласка, чи є у вас доставка в Польщу і скільки вона коштує?"],
  ["uk", "Юлія Савченко", "Дякую за швидку доставку і гарне пакування! Все сподобалось, замовлятиму ще."],
  ["uk", "Дмитро Кравчук", "Оплатив через Apple Pay, гроші списались, але сайт показав помилку і замовлення не створилось."],
  ["en", "James Carter", "I was charged twice for order #5821 — two identical payments of $89.99 on my card statement. Please refund the duplicate charge as soon as possible."],
  ["en", "Emily Wilson", "My package was supposed to arrive last Friday, but the tracking hasn't updated in five days. Is it lost?"],
  ["en", "Michael Brown", "The coffee machine I received leaks water from the bottom after every use. I'd like to return it for a full refund."],
  ["en", "Sophie Taylor", "I can't reset my password — the reset email never arrives, even in the spam folder. I've tried three times today."],
  ["en", "Daniel Harris", "Do you ship to Canada? If so, how long does delivery usually take and are there any customs fees?"],
  ["en", "Olivia Martin", "Just wanted to say thank you — the gift arrived beautifully wrapped and right on time. Great service!"],
];

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), priority TEXT, category TEXT,
  summary TEXT, draft_reply TEXT, analyzed_at TIMESTAMPTZ)`;
await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS language TEXT`;
await sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS translation TEXT`;

// Examples are dated over the past two weeks so they read as older tickets, not "new" ones.
const age = (i) => `${EXAMPLES.length - i} days ${i * 37} minutes`;

let added = 0;
for (const [i, [lang, name, message]] of EXAMPLES.entries()) {
  const exists = await sql`SELECT 1 FROM tickets WHERE message = ${message}`;
  if (exists.length) {
    await sql`UPDATE tickets SET language = ${lang} WHERE message = ${message} AND language IS NULL`;
    continue;
  }
  await sql`INSERT INTO tickets (customer_name, message, language, created_at)
    VALUES (${name}, ${message}, ${lang}, now() - ${age(i)}::interval)`;
  added++;
}
console.log(`Added ${added} example tickets (${EXAMPLES.length - added} already existed).`);
