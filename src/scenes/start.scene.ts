import { IBotContext } from "../context/context.interface";
import { BotService } from "../services/botservice";
import { Telegraf } from "telegraf";
import { Scenes } from "telegraf";
import { Scene } from "./scene.class";
import { Composer } from "telegraf";

export class StartScene extends Scene {
  constructor(bot: Telegraf<IBotContext>, botService: BotService) {
    super(bot, botService, [StartScene.sceneOne()]);
  }

  public static sceneName = "start_scene";

  actions(): void {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        "Приветики-пистолетики! Это Делаю Прямо Сейчас бот. Установи таймер и жди уведомляшки.",
      );
      return ctx.scene.enter("timer_scene");
    });

    this.bot.command("reset", async (ctx) => {
      return ctx.scene.enter("start_scene");
    });
  }

  static sceneOne(): Composer<IBotContext> {
    return new Composer<IBotContext>().use(async (ctx) => {
      ctx.reply("Hello, I'm BerealBot!");
      ctx.scene.leave();
    });
  }
}
