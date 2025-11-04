import postgres from 'postgres';

import { Weights } from '../interface';

import { Environment, EnvKey } from './environment';

export class Db {
    private db: postgres.Sql;
    constructor() {
        const user = Environment.get(EnvKey.DB_USER);
        const password = Environment.get(EnvKey.DB_PASSWORD);
        const host = Environment.get(EnvKey.DB_HOST);
        const database = Environment.get(EnvKey.DB_DATABASE);
        if (!user || !password) {
            throw new Error(
                'Database credentials are not set in environment variables. (.env) Please set DB_USER_DTI and DB_PASSWORD_DTI.'
            );
        }

        this.db = postgres({
            host,
            user,
            password,
            database,
            port: 5432,
            ssl: true
        });
    }

    public async getWeights(dt: string): Promise<Weights[]> {
        const r = await this
            .db`SELECT * FROM madrid_weights WHERE dt = ${dt} ORDER BY created_at DESC`;
        return r.map(
            row =>
                ({
                    ...row,
                    id: +row.id,
                    dt: row.dt.toJSON().slice(0, 10)
                } as Weights)
        );
    }
}
