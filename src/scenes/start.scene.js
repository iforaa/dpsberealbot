"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartScene = void 0;
const scene_class_1 = require("./scene.class");
const telegraf_1 = require("telegraf");
class StartScene extends scene_class_1.Scene {
    constructor(bot, botService) {
        super(bot, botService, [StartScene.sceneOne()]);
    }
    actions() {
        this.bot.start((ctx) => __awaiter(this, void 0, void 0, function* () {
            // ctx.session.canBeEditedMessage = null;
            var _a;
            let userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
            return ctx.scene.enter("start_scene");
        }));
        this.bot.command("reset", (ctx) => __awaiter(this, void 0, void 0, function* () {
            return ctx.scene.enter("start_scene");
        }));
    }
    static sceneOne() {
        return new telegraf_1.Composer().use((ctx) => __awaiter(this, void 0, void 0, function* () {
            ctx.scene.leave();
        }));
    }
}
exports.StartScene = StartScene;
StartScene.sceneName = "start_scene";
