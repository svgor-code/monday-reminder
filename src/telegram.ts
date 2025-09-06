import { Bot } from "grammy";

const bot = new Bot(process.env.TELEGRAM_TOKEN!);

const initializeCommands = () => {
  bot.command("start", (ctx) => ctx.reply("Привет! Буду напоминать о том, что пора затрекать время в Monday"));
}

export const sendMessage = async (message: string, chatId: number) => {
  try {
    await bot.api.sendMessage(chatId, message);
    console.log(`Сообщение отправлено в ${new Date().toLocaleString()}`);
  } catch (error) {
    console.log(error);
  }
}

export const startBot = () => {
  initializeCommands();
  bot.start();
}
