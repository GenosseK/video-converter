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
exports.FfmpegExecutor = void 0;
const path_1 = require("path");
const child_process_1 = require("child_process");
const command_executor_js_1 = require("../../core/executor/command.executor.js");
const files_service_js_1 = require("../../core/files/files.service.js");
const stream_handler_js_1 = require("../../core/handlers/stream.handler.js");
const prompt_service_js_1 = require("../../core/prompt/prompt.service.js");
const ffmpeg_builder_js_1 = require("./ffmpeg.builder.js");
class FfmpegExecutor extends command_executor_js_1.CommandExecutor {
    constructor(logger) {
        super(logger);
        this.fileService = new files_service_js_1.FileService();
        this.promptService = new prompt_service_js_1.PromptService();
    }
    prompt() {
        return __awaiter(this, void 0, void 0, function* () {
            const width = yield this.promptService.input('Width', 'number');
            const height = yield this.promptService.input('Height', 'number');
            const path = yield this.promptService.input('Path to file', 'input');
            const name = yield this.promptService.input('Name', 'input');
            const format = yield this.promptService.input('Video format (mp4/mkv/avi)', 'input');
            return { width, height, path, name, format };
        });
    }
    promptMultiple() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileCount = yield this.promptService.input('Number of files to convert', 'number');
            const changeOutputPath = yield this.promptService.input('Do you want to change the output path? (yes/no)', 'input');
            let outputPath;
            if (changeOutputPath.toLowerCase() === 'yes') {
                outputPath = yield this.promptService.input('Path to output directory', 'input');
            }
            if (fileCount === 1) {
                const singleInput = yield this.prompt();
                return Object.assign(Object.assign({}, singleInput), { outputPath });
            }
            else {
                const assignPaths = yield this.promptService.input('Do you want to assign paths to each video separately or specify a folder containing the videos? (separately/folder)', 'input');
                if (assignPaths.toLowerCase() === 'folder') {
                }
                else {
                    const applyToAll = yield this.promptService.input('Do you want to apply the same settings to all files? (yes/no)', 'input');
                    if (applyToAll.toLowerCase() === 'yes') {
                        const width = yield this.promptService.input('Width', 'number');
                        const height = yield this.promptService.input('Height', 'number');
                        const format = yield this.promptService.input('Video format (mp4/mkv/avi)', 'input');
                        const inputs = [];
                        for (let i = 0; i < fileCount; i++) {
                            const path = yield this.promptService.input(`Path to file ${i + 1}`, 'input');
                            const name = yield this.promptService.input(`Output name for file ${(0, path_1.basename)(path)} (leave blank to keep original name)`, 'input');
                            const sanitizedOutputName = name.trim() || (0, path_1.basename)(path, (0, path_1.extname)(path));
                            inputs.push({ width, height, path, name: sanitizedOutputName, format, outputPath });
                        }
                        return inputs;
                    }
                    else {
                        const inputs = [];
                        for (let i = 0; i < fileCount; i++) {
                            const path = yield this.promptService.input(`Path to file ${i + 1}`, 'input');
                            const width = yield this.promptService.input(`Width for file ${(0, path_1.basename)(path)}`, 'number');
                            const height = yield this.promptService.input(`Height for file ${(0, path_1.basename)(path)}`, 'number');
                            const name = yield this.promptService.input(`Output name for file ${(0, path_1.basename)(path)} (leave blank to keep original name)`, 'input');
                            const format = yield this.promptService.input(`Video format (mp4/mkv/avi) for file ${i + 1}`, 'input');
                            inputs.push({ width, height, path, name: name.trim() || (0, path_1.basename)(path), format, outputPath });
                        }
                        return inputs;
                    }
                }
            }
            return [];
        });
    }
    build(input) {
        const { width, height, path, name, format, outputPath } = input;
        const output = this.fileService.getFilePath(outputPath, name, format || (0, path_1.extname)(path).slice(1), path);
        const args = (new ffmpeg_builder_js_1.FfmpegBuilder(format))
            .input(path)
            .setVideoSize(width, height)
            .output(output);
        // Log the generated FFmpeg command
        console.log("Generated FFmpeg command:", args);
        return { command: 'ffmpeg', args, output };
    }
    spawn({ output, command: command, args }) {
        this.fileService.deleteFileIfExists(output);
        return (0, child_process_1.spawn)(command, args);
    }
    processStream(stream, logger) {
        const handler = new stream_handler_js_1.StreamHandler(logger);
        handler.processOutput(stream);
    }
}
exports.FfmpegExecutor = FfmpegExecutor;
