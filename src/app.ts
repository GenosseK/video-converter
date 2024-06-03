import { FfmpegExecutor } from "./commands/ffmpeg/ffmpeg.executor.js";
import { ConsoleLogger } from "./out/console-logger/console.logger.js";
import readline from 'readline';

export class App {
    async run() {
        const executor = new FfmpegExecutor(ConsoleLogger.getInstance());
        await executor.execute();
        this.waitForExit();
    }

    waitForExit() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('', () => {
            rl.close();
            process.exit(0);
        });
    }
}

const app = new App();
app.run();