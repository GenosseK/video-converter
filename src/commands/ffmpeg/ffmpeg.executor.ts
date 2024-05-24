
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { extname } from "path";
import { CommandExecutor } from "../../core/executor/command.executor.js";
import { FileService } from "../../core/files/files.service.js";
import { StreamHandler } from "../../core/handlers/stream.handler.js";
import { IStreamLogger } from "../../core/handlers/stream.logger.inteface.js";
import { PromptService } from "../../core/prompt/prompt.service.js";
import { FfmpegBuilder } from "./ffmpeg.builder.js";
import { ICommandExecFfmpeg, IFfmpegInput } from "./ffmpeg.types.js";

export class FfmpegExecutor extends CommandExecutor<IFfmpegInput> {
    private fileService: FileService = new FileService();
    private promptService: PromptService = new PromptService();

    constructor(logger: IStreamLogger) {
        super(logger);
    }

    protected async prompt(): Promise<IFfmpegInput> {
        const width = await this.promptService.input<number>('Width', 'number');
        const height = await this.promptService.input<number>('Height', 'number');
        const path = await this.promptService.input<string>('Path to file', 'input');
        const name = await this.promptService.input<string>('Name', 'input');
        const format = await this.promptService.input<'mp4' | 'mkv' | 'avi'>('Video format (mp4/mkv/avi)', 'input');
        return { width, height, path, name, format };
    }

    protected async promptMultiple(): Promise<IFfmpegInput | IFfmpegInput[]> {
        const fileCount = await this.promptService.input<number>('Number of files to convert', 'number');
        if (fileCount === 1) {
            return this.prompt();
        } else {
            const inputs: IFfmpegInput[] = [];
            for (let i = 0; i < fileCount; i++) {
                const width = await this.promptService.input<number>(`Width for file ${i + 1}`, 'number');
                const height = await this.promptService.input<number>(`Height for file ${i + 1}`, 'number');
                const path = await this.promptService.input<string>(`Path to file ${i + 1}`, 'input');
                const name = await this.promptService.input<string>(`Output name for file ${i + 1}`, 'input');
                const format = await this.promptService.input<'mp4' | 'mkv' | 'avi'>(`Video format (mp4/mkv/avi) for file ${i + 1}`, 'input');
                inputs.push({ width, height, path, name, format });
            }
            return inputs;
        }
    }

    protected build(input: IFfmpegInput): ICommandExecFfmpeg {
        const { width, height, path, name, format } = input;
        const output = this.fileService.getFilePath(path, name, format || extname(path).slice(1));
        const args = (new FfmpegBuilder(format))
            .input(path)
            .setVideoSize(width, height)
            .output(output);

        // Log the generated FFmpeg command
        console.log("Generated FFmpeg command:", args);

        return { command: 'ffmpeg', args, output };
    }

    protected spawn({ output, command: command, args }: ICommandExecFfmpeg): ChildProcessWithoutNullStreams {
        this.fileService.deleteFileIfExists(output);
        return spawn(command, args);
    }

    protected processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void {
        const handler = new StreamHandler(logger);
        handler.processOutput(stream);
    }
}