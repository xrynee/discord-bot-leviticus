import 'isomorphic-fetch'; // Polyfill for the fetch API
import Eris from 'eris';

import { DIVIDER, FILES } from '../config';
import { IService, Weights } from '../interface';
import { DataSwitchboardClient, Environment, EnvKey, LocalStorage } from '../util';

interface WeightsResult {
    version: string;
    weights: Weights;
}

export class DbWatcherService implements IService {
    private bot: Eris.Client;
    // private db: Db;
    private swbClient: DataSwitchboardClient;
    private isAlwaysPollingWindow: boolean;

    constructor(bot: Eris.Client) {
        this.bot = bot;
        // this.db = new Db();
        this.swbClient = new DataSwitchboardClient();
        this.isAlwaysPollingWindow = Environment.getBoolean(EnvKey.IS_ALWAYS_POLLING_WINDOW);
    }

    async checkWeightsTable() {
        const todayDt =
            Environment.get(EnvKey.DT_OVERRIDE) || new Date().toISOString().split('T')[0];

        const versions = [
            {
                version: 'V1',
                historyKey: FILES.LAST_WEIGHT_ID,
                fetch: () => this.swbClient.getWeights(todayDt)
            },
            {
                version: 'V2',
                historyKey: FILES.LAST_WEIGHT_ID_V2,
                fetch: () => this.swbClient.getWeightsV2(todayDt)
            }
        ];

        const newWeights: WeightsResult[] = [];

        for (const config of versions) {
            try {
                const weightsResponse = await config.fetch();

                if (!(weightsResponse?.length > 0)) {
                    console.log(`No daily weights found for ${config.version}.`);
                    continue;
                }

                const weights = weightsResponse[0];

                const lastWeightId = +(await LocalStorage.get<string>(config.historyKey));
                if (weights.id === lastWeightId) {
                    console.log(`No new weights found for ${config.version}.`);
                    continue;
                }

                await LocalStorage.set(config.historyKey, weights.id.toString());
                console.log(
                    `New weights found for ${config.version}! DT: ${weights.dt}, ID: ${weights.id}`
                );
                newWeights.push({ version: config.version, weights });
            } catch (error) {
                console.error(`Error checking weights for ${config.version}:`, error);
            }
        }

        if (newWeights.length === 0) return;

        const messageContent = this.buildMessage(newWeights);

        const channelId: string = await LocalStorage.get(FILES.CHANNEL);
        await this.bot.createMessage(channelId, messageContent);
    }

    private buildMessage(results: WeightsResult[]): string {
        const sections = results.map(({ version, weights }) => {
            let output = `**${version} — ${weights.dt}**\n\nLeverage: ${weights.leverage}\n`;
            ['XLC', 'XLY', 'XLP', 'XLE', 'XLF', 'XLV', 'XLI', 'XLB', 'XLRE', 'XLK', 'XLU'].forEach(
                symbol => {
                    const value = weights[`${symbol}_log` as keyof Weights] as number;
                    const roundedValue = Math.round(value * 100);
                    if (roundedValue > 0) {
                        output += `${symbol}: ${roundedValue}%\n`;
                    }
                }
            );
            return output;
        });

        return sections.join('\n') + '\n\n' + DIVIDER + '\n\n';
    }

    public async start(): Promise<void> {
        let pollingInterval: NodeJS.Timeout | null = null;

        const checkAndPoll = async () => {
            const inWindow = this.isAlwaysPollingWindow || this.isInPollingWindow();

            if (inWindow) {
                // We're in the polling window, poll every 10 seconds
                if (!pollingInterval) {
                    console.log(
                        'Entered weights polling window (3:50pm-4pm EST). Starting frequent polling...'
                    );
                    await this.checkWeightsTable(); // Check immediately
                    pollingInterval = setInterval(async () => {
                        await this.checkWeightsTable();
                    }, 10000); // Every 10 seconds
                }
            } else {
                // We're outside the window, stop frequent polling
                if (pollingInterval) {
                    console.log('Exited weights polling window. Stopping frequent polling.');
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
            }
        };

        await this.checkWeightsTable(); // Check immediately for a new weight

        // Check every minute to see if we've entered the window
        await checkAndPoll(); // Check window immediately on startup
        setInterval(async () => {
            await checkAndPoll();
        }, 60000); // Check every minute
    }

    private isInPollingWindow(): boolean {
        const now = new Date();

        // Get the time in America/New_York timezone (handles EST/EDT automatically)
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

        // Check if we're between 3:50pm (15:50) and 4:00pm (16:00) or 12:50 and 12:59
        if ((hours === 15 || hours === 12) && minutes >= 50) {
            return true;
        }
        if (hours === 16 && minutes === 0) {
            return true;
        }

        return false;
    }
}
