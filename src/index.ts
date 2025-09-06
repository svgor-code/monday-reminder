import { Hono } from "hono";
import { Bot } from "grammy";
import db from "./providers/db";
import cron from 'node-cron';
import "dotenv/config";

const app = new Hono();

const bot = new Bot(process.env.TELEGRAM_TOKEN!);

bot.command("start", (ctx) => ctx.reply("Привет! Буду напоминать о том, что пора затрекать время в Monday"));

bot.start();

// --- CRON (каждый будний день в 20:00) ---
// cron формат: "минуты часы * * дни_недели"
// 0 20 * * 1-5  => 20:00, с понедельника по пятницу
cron.schedule("0 20 * * 1-5", async () => {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.error("TELEGRAM_CHAT_ID не указан в .env");
    return;
  }
  await bot.api.sendMessage(chatId, "Напоминание: пора сделать важное дело! 📌 Затрекайте время в Monday");
  console.log(`[CRON] Сообщение отправлено в ${new Date().toLocaleString()}`);
});

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server running at http://localhost:${port}`);

Bun.serve({
  port,
  fetch: app.fetch,
});
