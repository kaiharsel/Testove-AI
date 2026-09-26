// Adds example support tickets. Usage: npm run seed (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";

const EXAMPLES = [
  ["Ірина Коваль", "Замовлення №4471 мало прийти ще в понеділок, а трекінг Нової пошти досі показує «очікує відправлення». Коли відправите?"],
  ["Максим Бондар", "Карта двічі списала 1 249 грн за одне замовлення. Прошу терміново повернути зайве списання!"],
  ["Світлана Мельник", "Отримала навушники, лівий не працює взагалі. Хочу повернути товар і отримати гроші назад."],
  ["Олег Шевчук", "Не можу увійти в особистий кабінет — після введення пароля сторінка просто перезавантажується. Пробував у Chrome і Safari."],
  ["Наталія Ткаченко", "Кур'єр нагрубив і кинув посилку біля дверей, коробка пом'ята. Дуже неприємно, більше у вас не замовлятиму."],
  ["Андрій Лисенко", "Підкажіть, будь ласка, чи є у вас доставка в Польщу і скільки вона коштує?"],
  ["Юлія Савченко", "Дякую за швидку доставку і гарне пакування! Все сподобалось, замовлятиму ще."],
  ["Дмитро Кравчук", "Оплатив через Apple Pay, гроші списались, але сайт показав помилку і замовлення не створилось."],
];

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), priority TEXT, category TEXT,
  summary TEXT, draft_reply TEXT, analyzed_at TIMESTAMPTZ)`;

let added = 0;
for (const [name, message] of EXAMPLES) {
  const exists = await sql`SELECT 1 FROM tickets WHERE message = ${message}`;
  if (exists.length) continue;
  await sql`INSERT INTO tickets (customer_name, message) VALUES (${name}, ${message})`;
  added++;
}
console.log(`Added ${added} example tickets (${EXAMPLES.length - added} already existed).`);
