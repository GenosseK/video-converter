"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegBuilder = void 0;
const path_1 = require("path");
class FfmpegBuilder {
    constructor(format) {
        this.options = new Map();
        this.options.set('-c:v', 'libx264');
        if (format) {
            this.setFormat(format);
        }
    }
    input(inputPath) {
        this.inputPath = inputPath;
        return this;
    }
    setVideoSize(width, height) {
        this.options.set('-s', `${width}x${height}`);
        return this;
    }
    setFormat(format) {
        this.format = format;
        return this;
    }
    getOutputFormat() {
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
        }
        else if (this.inputPath) {
            // Determine output format based on input file extension
            const ext = (0, path_1.extname)(this.inputPath).toLowerCase();
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
        }
        else {
            throw new Error('Format or input path is required');
        }
    }
    output(outputPath) {
        if (!this.inputPath) {
            throw new Error('Input was not set');
        }
        const args = ['-i', this.inputPath];
        this.options.forEach((value, key) => {
            args.push(key);
            args.push(value);
        });
        const outputFormat = this.getOutputFormat();
        args.push('-f', outputFormat);
        args.push(outputPath); // Keep the file extension for the output path
        return args;
    }
}
exports.FfmpegBuilder = FfmpegBuilder;
