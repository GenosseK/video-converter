import { FfmpegExecutor } from "./commands/ffmpeg/ffmpeg.executor.js";
import { ConsoleLogger } from "./out/console-logger/console.logger.js";

export class App {
    async run() {
        const executor = new FfmpegExecutor(ConsoleLogger.getInstance());
        await executor.execute();
    }
}

const app = new App();
app.run();