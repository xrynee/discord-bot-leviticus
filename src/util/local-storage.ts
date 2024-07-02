import { mkdir, readJSON, stat, writeJson } from 'fs-extra';

export class LocalStorage {
    public static async set(key: string, value: object | string): Promise<void> {
        await this.ensurePath();
        await writeJson(`./data/${key}.json`, value);
    }
    public static async get<T>(key: string): Promise<T> {
        await this.ensurePath();
        try {
            const data = await readJSON(`./data/${key}.json`);
            if (!data) {
                return null;
            }
            return data;
        } catch (e) {
            return null;
        }
    }

    private static async ensurePath(): Promise<void> {
        try {
            const s = await stat(`./data`);
            if (!s.isDirectory) {
                await mkdir('./data');
            }
        } catch (e) {
            await mkdir('./data');
        }
    }
}
