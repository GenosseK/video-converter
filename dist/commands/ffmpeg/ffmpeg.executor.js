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
            return { width, height, path, name };
        });
    }
    build({ width, height, path, name }) {
        const output = this.fileService.getFilePath(path, name, 'mp4');
        const args = (new ffmpeg_builder_js_1.FfmpegBuilder)
            .input(path)
            .setVideoSize(width, height)
            .output(output);
        return { command: 'ffmpeg', args, output };
    }
    spawn({ output, command: commmand, args }) {
        this.fileService.deleteFileIfExists(output);
        return (0, child_process_1.spawn)(commmand, args);
    }
    processStream(stream, logger) {
        const handler = new stream_handler_js_1.StreamHandler(logger);
        handler.processOutput(stream);
    }
}
exports.FfmpegExecutor = FfmpegExecutor;
