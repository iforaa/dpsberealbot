import { Composer, Scenes, Telegraf, Markup } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { BotService } from "../services/botservice";
import { Scene } from "./scene.class";

export class TimerScene extends Scene {
  constructor(bot: Telegraf<IBotContext>, botService: BotService) {
    super(bot, botService, [
      TimerScene.sceneOne(botService),
      TimerScene.sceneTwo(botService),
    ]);
  }

  public static sceneName = "timer_scene";

  actions(): void {
    this.bot.command("settimer", async (ctx) => {
      return ctx.scene.enter(TimerScene.sceneName);
    });

    this.bot.command("currenttimer", async (ctx) => {
      const chat_settings = await this.botService.getChatSettings(ctx.chat?.id);
      await ctx.reply(
        `Текущий таймер: ${chat_settings.start_time} - ${chat_settings.end_time} в часовом поясе ${chat_settings.timezone}.`,
      );
    });
  }

  static sceneOne(botService: BotService): Composer<IBotContext> {
    return new Composer<IBotContext>().on("text", async (ctx) => {
      const input = ctx.message.text;
      const userId = ctx.chat?.id;
      console.log("userId", userId);
      try {
        console.log("step 1");
        // Validate the timer format
        const timerRegex =
          /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

        console.log("step 2");
        if (!timerRegex.test(input)) {
          console.log("step 3");
          await ctx.reply("Используй формат Ч:M-Ч:М (например, 13:00-17:00).");
          return;
        }
        console.log("step 4");
        // Save the timer input temporarily in session
        ctx.session.timerInput = input;

        // Provide timezone selection with inline buttons
        await ctx.reply(
          "Выберите ваш часовой пояс:",
          Markup.inlineKeyboard([
            [Markup.button.callback("UTC ±0", "timezone_0")],
            [Markup.button.callback("Europe +1", "timezone_1")],
            [Markup.button.callback("Moscow +3", "timezone_3")],
            [Markup.button.callback("Asia +5", "timezone_5")],
            [Markup.button.callback("Custom +X", "timezone_custom")],
          ]),
        );
      } catch (error) {
        console.error(`Failed to process chat ID ${userId}:`, error);
      }

      // Move to the next scene
      return ctx.wizard.next();
    });
  }

  static sceneTwo(botService: BotService): Composer<IBotContext> {
    return new Composer<IBotContext>()
      .action(/timezone_(\d+)/, async (ctx) => {
        const offset = Number(ctx.match[1]);
        const userId = ctx.chat?.id;

        // Retrieve timer input from session
        const timerInput = ctx.session.timerInput;

        // Calculate timezone abbreviation (e.g., UTC±X)
        const timezone = `UTC${offset >= 0 ? "+" : ""}${offset}`;

        // Save the timer and timezone
        const [startTime, endTime] = timerInput.split("-");
        await botService.setTimer(userId!, startTime, endTime, timezone);

        await ctx.reply(
          `Таймер установлен на время ${startTime} до ${endTime} в часовом поясе ${timezone}.`,
        );

        // Leave the scene
        return ctx.scene.leave();
      })
      .action("timezone_custom", async (ctx) => {
        await ctx.reply(
          "Введите ваш часовой пояс вручную в формате UTC±X (например, UTC+5):",
        );
      })
      .on("text", async (ctx) => {
        const input = ctx.message.text.trim();

        // Validate custom timezone format
        const customTimezoneRegex = /^UTC[+-]\d{1,2}$/;
        if (!customTimezoneRegex.test(input)) {
          await ctx.reply(
            "Неверный формат. Попробуй ещё раз (например, UTC+5):",
          );
          return;
        }

        const userId = ctx.chat?.id;
        const timerInput = ctx.session.timerInput;

        // Save the timer with the custom timezone
        const [startTime, endTime] = timerInput.split("-");
        await botService.setTimer(userId!, startTime, endTime, input);

        await ctx.reply(
          `Таймер установлен на время ${startTime} до ${endTime} в часовом поясе ${input}.`,
        );

        // Leave the scene
        return ctx.scene.leave();
      });
  }
}
