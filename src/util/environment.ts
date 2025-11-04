import { config } from 'dotenv';

import { resolve } from 'path';

export enum EnvKey {
    DISCORD_BOT_TOKEN = 'DISCORD_BOT_TOKEN',

    EMAIL_CLIENT_ID = 'EMAIL_CLIENT_ID',
    EMAIL_TENANT_ID = 'EMAIL_TENANT_ID',
    EMAIL_CLIENT_SECRET = 'EMAIL_CLIENT_SECRET',

    DB_USER = 'DB_USER',
    DB_PASSWORD = 'DB_PASSWORD',
    DB_HOST = 'DB_HOST',
    DB_DATABASE = 'DB_DATABASE',

    IS_ALWAYS_POLLING_WINDOW = 'IS_ALWAYS_POLLING_WINDOW',
    DT_OVERRIDE = 'DT_OVERRIDE'
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
