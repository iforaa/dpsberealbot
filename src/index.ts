import { Telegraf, Scenes } from "telegraf";
import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
import { Scene } from "./scenes/scene.class";
import { IBotContext } from "./context/context.interface";
import { BotService } from "./services/botservice";
import LocalSession from "telegraf-session-local";
import { StartScene } from "./scenes/start.scene";
import { DbService } from "./services/db.service";
import { DBRepository } from "./repository/db.repository";
import { TimerScene } from "./scenes/timer.scene";
import { Scheduler } from "./services/scheduler";

class Bot {
  bot: Telegraf<IBotContext>;
  scenes: Scene[] = [];
  private botService: BotService;

  constructor(private readonly configService: IConfigService) {
    this.bot = new Telegraf<IBotContext>(this.configService.get("BOT_TOKEN"));
    this.bot.use(new LocalSession({ database: "sessions.json" }).middleware());

    this.botService = new BotService(
      new DBRepository(new DbService(this.configService.get("DATABASE_URL"))),
    );
  }

  init() {
    this.scenes = [
      new StartScene(this.bot, this.botService),
      new TimerScene(this.bot, this.botService),
    ];

    const stage = new Scenes.Stage<IBotContext>(this.scenes);
    this.bot.use(stage.middleware());

    for (const scene of this.scenes) {
      scene.actions();
    }

    const scheduler = new Scheduler(this.bot, this.botService);
    scheduler.start();

    this.bot.launch();
  }
}

const bot = new Bot(new ConfigService());
bot.init();
