import { promises as fs } from "fs";
import { isAbsolute, join, dirname, extname, basename } from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
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
        const changeOutputPath = await this.promptService.input<string>('Do you want to change the output path? (yes/no)', 'input');
        let outputPath: string | undefined;

        if (changeOutputPath.toLowerCase() === 'yes') {
            outputPath = await this.promptService.input<string>('Path to output directory', 'input');
        }

        if (fileCount === 1) {
            const singleInput = await this.prompt();
            return { ...singleInput, outputPath };
        } else {
            const assignPaths = await this.promptService.input<string>('Do you want to assign paths to each video separately or specify a folder containing the videos? (separately/folder)', 'input');

            if (assignPaths.toLowerCase() === 'folder') {
                
            } else {
                const applyToAll = await this.promptService.input<string>('Do you want to apply the same settings to all files? (yes/no)', 'input');

                if (applyToAll.toLowerCase() === 'yes') {
                    const width = await this.promptService.input<number>('Width', 'number');
                    const height = await this.promptService.input<number>('Height', 'number');
                    const format = await this.promptService.input<'mp4' | 'mkv' | 'avi'>('Video format (mp4/mkv/avi)', 'input');

                    const inputs: IFfmpegInput[] = [];
                    for (let i = 0; i < fileCount; i++) {
                        const path = await this.promptService.input<string>(`Path to file ${i + 1}`, 'input');
                        const name = await this.promptService.input<string>(`Output name for file ${basename(path)} (leave blank to keep original name)`, 'input');
                        const sanitizedOutputName = name.trim() || basename(path, extname(path));
                        inputs.push({ width, height, path, name: sanitizedOutputName, format, outputPath });
                    }
                    return inputs;
                } else {
                    const inputs: IFfmpegInput[] = [];
                    for (let i = 0; i < fileCount; i++) {
                        const path = await this.promptService.input<string>(`Path to file ${i + 1}`, 'input');
                        const width = await this.promptService.input<number>(`Width for file ${basename(path)}`, 'number');
                        const height = await this.promptService.input<number>(`Height for file ${basename(path)}`, 'number');
                        const name = await this.promptService.input<string>(`Output name for file ${basename(path)} (leave blank to keep original name)`, 'input');
                        const format = await this.promptService.input<'mp4' | 'mkv' | 'avi'>(`Video format (mp4/mkv/avi) for file ${i + 1}`, 'input');
                        inputs.push({ width, height, path, name: name.trim() || basename(path), format, outputPath });
                    }
                    return inputs;
                }
            }
        }


        return [];
    }

    protected build(input: IFfmpegInput): ICommandExecFfmpeg {
        const { width, height, path, name, format, outputPath } = input;
        const output = this.fileService.getFilePath(outputPath, name, format || extname(path).slice(1), path);
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