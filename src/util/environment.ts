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

    SWB_CLIENT_ID = 'SWB_CLIENT_ID',
    SWB_CLIENT_SECRET = 'SWB_CLIENT_SECRET',
    SWB_BASE_URL = 'SWB_BASE_URL',
    SWB_SCOPE = 'SWB_SCOPE',
    SWB_TENANT_ID = 'SWB_TENANT_ID',

    SIGNAL_BASE_URL = 'SIGNAL_BASE_URL',

    CORE_API_BASE_URL = 'CORE_API_BASE_URL',

    IS_ALWAYS_POLLING_WINDOW = 'IS_ALWAYS_POLLING_WINDOW',
    DT_OVERRIDE = 'DT_OVERRIDE'
}

export class Environment {
    private static initialized = false;

    public static init(): void {
        const path = `${resolve()}`;
        config({ path: `${path}/.env` });
        this.initialized = true;
    }

    public static get(key: EnvKey): string {
        // Anything constructed while modules load — the COMMANDS array, for one — reads env
        // before index.ts reaches its init() call. dotenv never overwrites an existing value,
        // so self-initializing here is safe and keeps that ordering from mattering.
        if (!this.initialized) {
            this.init();
        }
        return process.env[key.valueOf()];
    }

    public static getNumber(key: EnvKey): number {
        return +this.get(key);
    }

    public static getBoolean(key: EnvKey): boolean {
        return this.get(key) === 'true';
    }
}
