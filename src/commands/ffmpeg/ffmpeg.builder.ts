import { extname } from 'path';

export class FfmpegBuilder {
	private inputPath: string;
	private options: Map<string, string> = new Map();
	private format?: string;

	constructor(format?: string) {
		this.options.set('-c:v', 'libx264');
		if (format) {
			this.setFormat(format);
		}
	}

	input(inputPath: string): this {
		this.inputPath = inputPath;
		return this;
	}

	setVideoSize(width?: number, height?: number): this {
		if ((width === undefined || isNaN(width)) && (height === undefined || isNaN(height))) {
			return this;
		}

		let scaleOption = 'scale=';
		if (width !== undefined && !isNaN(width)) {
			scaleOption += `${width}:-2`;
		} else if (height !== undefined && !isNaN(height)) {
			scaleOption += `-2:${height}`;
		}

		this.options.set('-vf', scaleOption);

		return this;
	}

	setFormat(format: string): this {
		this.format = format;
		return this;
	}

	private getOutputFormat(): string {
		if (this.format) {
			switch (this.format.toLowerCase()) {
				case 'mp4':
					return 'mp4';
				case 'mkv':
					return 'matroska';
				case 'avi':
					return 'avi';
				default:
					throw new Error('Unsupported output file format');
			}
		} else if (this.inputPath) {
			const ext = extname(this.inputPath).toLowerCase();
			switch (ext) {
				case '.mp4':
					return 'mp4';
				case '.mkv':
					return 'matroska';
				case '.avi':
					return 'avi';
				default:
					throw new Error('Unsupported input file format');
			}
		} else {
			throw new Error('Format or input path is required');
		}
	}

	output(outputPath: string): string[] {
		if (!this.inputPath) {
			throw new Error('Input was not set');
		}
		const args: string[] = ['-i', this.inputPath];
		this.options.forEach((value, key) => {
			args.push(key);
			args.push(value);
		});
		const outputFormat = this.getOutputFormat();
		args.push('-f', outputFormat);
		args.push(outputPath);
		return args;
	}
}