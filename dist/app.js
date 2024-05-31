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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const ffmpeg_executor_js_1 = require("./commands/ffmpeg/ffmpeg.executor.js");
const console_logger_js_1 = require("./out/console-logger/console.logger.js");
const readline_1 = __importDefault(require("readline"));
class App {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const executor = new ffmpeg_executor_js_1.FfmpegExecutor(console_logger_js_1.ConsoleLogger.getInstance());
            yield executor.execute();
            this.waitForExit();
        });
    }
    waitForExit() {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('', () => {
            rl.close();
            process.exit(0);
        });
    }
}
exports.App = App;
const app = new App();
app.run();
