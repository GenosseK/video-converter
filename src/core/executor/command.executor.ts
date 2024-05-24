import { ChildProcessWithoutNullStreams } from "child_process";
import { IStreamLogger } from "../handlers/stream.logger.inteface.js";
import { ICommandExec } from "./command.types.js";

export abstract class CommandExecutor<Input> {
    constructor(protected logger: IStreamLogger) {}

    public async execute() {
        const inputs = await this.promptMultiple();
        if (Array.isArray(inputs)) {
            for (const input of inputs) {
                await this.executeCommand(input);
            }
        } else {
            await this.executeCommand(inputs);
        }
    }

    private async executeCommand(input: Input) {
        const command = this.build(input);
        const stream = this.spawn(command);
        this.processStream(stream, this.logger);
    }

    protected abstract prompt(): Promise<Input>;
    protected abstract promptMultiple(): Promise<Input | Input[]>;
    protected abstract build(input: Input): ICommandExec;
    protected abstract spawn(command: ICommandExec): ChildProcessWithoutNullStreams;
    protected abstract processStream(stream: ChildProcessWithoutNullStreams, logger: IStreamLogger): void;
}
