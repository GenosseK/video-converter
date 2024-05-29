import { promises } from "fs";
import { isAbsolute, join, dirname } from "path";

export class FileService {
    private async isExist(path: string) {
        try {
            await promises.stat(path);
            return true;
        } catch {
            return false;
        }
    }

    public getFilePath(outputPath: string | undefined, name: string, ext: string, inputPath: string): string {
        let path = outputPath || dirname(inputPath);
        if (!isAbsolute(path)) {
            path = join(__dirname, path);
        }
        return join(path, `${name}.${ext}`);
    }

    async deleteFileIfExists(path: string) {
        if (await this.isExist(path)) {
            await promises.unlink(path);
        }
    }
}
