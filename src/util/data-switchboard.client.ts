import { Weights } from '../interface';

import { Environment, EnvKey } from './environment';

export class DataSwitchboardClient {
    private token: string | null = null;
    private clientSecret: string;
    private clientId: string;
    private baseUrl: string;
    private scope: string;
    private tokenUrl: string;

    constructor() {
        this.clientSecret = Environment.get(EnvKey.SWB_CLIENT_SECRET);
        this.clientId = Environment.get(EnvKey.SWB_CLIENT_ID);
        this.baseUrl = Environment.get(EnvKey.SWB_BASE_URL);
        this.scope = Environment.get(EnvKey.SWB_SCOPE);

        const tenantId = Environment.get(EnvKey.SWB_TENANT_ID);
        this.tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    }

    async getWeights(dt: string) {
        return this.get<Weights[]>(`/weights?dt=${dt}&strategy=allgpr`);
    }

    private async getToken(): Promise<string> {
        if (this.token) {
            return this.token;
        }

        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: this.scope
        });

        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        this.token = tokenData.access_token;
        return tokenData.access_token;
    }

    private async get<T>(url: string): Promise<T> {
        const token = await this.getToken();
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return response.json();
    }
}
