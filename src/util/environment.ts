import { config } from 'dotenv';

import { resolve } from 'path';

export enum EnvKey {
    DISCORD_BOT_TOKEN = 'DISCORD_BOT_TOKEN'
}

export class Environment {
    public static init(): void {
        const path = `${resolve()}`;
        config({ path: `${path}/.env` });
    }

    public static get(key: EnvKey): string {
        return process.env[key.valueOf()];
    }

    public static getNumber(key: EnvKey): number {
        return +this.get(key);
    }

    public static getBoolean(key: EnvKey): boolean {
        return this.get(key) === 'true';
    }
}
