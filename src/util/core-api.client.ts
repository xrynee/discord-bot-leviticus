import { Bar, Quote } from '../interface';

import { Environment, EnvKey } from './environment';

// Provider 1 is live — it quotes and prints today's bar, but its daily history only reaches
// back a few months. Provider 4 carries years of history and never has today. Their closes
// agree exactly on overlapping dates, so the two can be stitched together.
export const LIVE_PROVIDER = 1;
export const HISTORY_PROVIDER = 4;

export class CoreApiClient {
    private token: string | null = null;
    private clientSecret: string;
    private clientId: string;
    private baseUrl: string;
    private scope: string;
    private tokenUrl: string;

    constructor() {
        // core-api sits behind the same Entra app registration as the switchboard.
        this.clientSecret = Environment.get(EnvKey.SWB_CLIENT_SECRET);
        this.clientId = Environment.get(EnvKey.SWB_CLIENT_ID);
        this.baseUrl = Environment.get(EnvKey.CORE_API_BASE_URL);
        this.scope = Environment.get(EnvKey.SWB_SCOPE);

        const tenantId = Environment.get(EnvKey.SWB_TENANT_ID);
        this.tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    }

    // Latest price for a symbol. Use `last` for the current mark.
    async getQuote(symbol: string) {
        return this.get<Quote>(`/quotes/${symbol}?provider=${LIVE_PROVIDER}`);
    }

    // Daily bars, inclusive of both dates. Dates must be YYYY-MM-DD.
    async getBars(symbol: string, fromDate: string, toDate: string, provider = HISTORY_PROVIDER) {
        return this.get<Bar[]>(
            `/bars/D/${symbol}?provider=${provider}&from=${fromDate}&to=${toDate}`
        );
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
        // Without this the fetch below fails as "Invalid URL", which says nothing useful.
        if (!this.baseUrl) {
            throw new Error(`CORE_API_BASE_URL is not set in .env — cannot call core-api ${url}`);
        }

        const token = await this.getToken();
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`core-api ${url} failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
}
