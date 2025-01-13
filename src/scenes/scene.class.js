"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const telegraf_1 = require("telegraf");
class Scene extends telegraf_1.Scenes.WizardScene {
    constructor(bot, botService, steps) {
        super(new.target.sceneName, ...steps);
        this.bot = bot;
        this.botService = botService;
        this.steps = steps;
    }
}
exports.Scene = Scene;
