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
		return { width, height, path, name };
	}

	protected build({ width, height, path, name }: IFfmpegInput): ICommandExecFfmpeg {
		const output = this.fileService.getFilePath(path, name, 'mp4');
		const args = (new FfmpegBuilder)
			.input(path)
			.setVideoSize(width, height)
			.output(output);
		return { command: 'ffmpeg', args, output };
	}

	protected spawn({ output, command: commmand, args }: ICommandExecFfmpeg): ChildProcessWithoutNullStreams {
		this.fileService.deleteFileIfExists(output);
		return spawn(commmand, args);
	}

	protected processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void {
		const handler = new StreamHandler(logger);
		handler.processOutput(stream);
	}
}