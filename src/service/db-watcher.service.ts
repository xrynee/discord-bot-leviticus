import 'isomorphic-fetch'; // Polyfill for the fetch API
import Eris from 'eris';

import { DIVIDER, FILES } from '../config';
import { IService, Weights } from '../interface';
import { DataSwitchboardClient, Environment, EnvKey, LocalStorage } from '../util';

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
        try {
            const todayDt =
                Environment.get(EnvKey.DT_OVERRIDE) || new Date().toISOString().split('T')[0];
            const weightsResponse = await this.swbClient.getWeights(todayDt);

            if (weightsResponse?.length > 0) {
                const weights = weightsResponse[0];

                const lastWeightId = +(await LocalStorage.get(FILES.LAST_WEIGHT_ID));
                if (weights.id !== lastWeightId) {
                    await LocalStorage.set(FILES.LAST_WEIGHT_ID, weights.id.toString());
                } else {
                    console.log('No new weights found.');
                    return;
                }
                console.log(`New weights found! DT: ${weights.dt}, ID: ${weights.id}`);

                const messageContent = this.buildMessage(weights);

                const channelId: string = await LocalStorage.get(FILES.CHANNEL);
                await this.bot.createMessage(channelId, messageContent);
            } else {
                console.log('No new daily weights found.');
            }
        } catch (error) {
            console.error('Error checking weights:', error);
        }
    }

    private buildMessage(weights: Weights): string {
        let output = `**${weights.dt}**\n\nLeverage: ${weights.leverage}\n`;
        ['XLC', 'XLY', 'XLP', 'XLE', 'XLF', 'XLV', 'XLI', 'XLB', 'XLRE', 'XLK', 'XLU'].forEach(
            symbol => {
                const value = weights[`${symbol}_log` as keyof Weights] as number;
                const roundedValue = Math.round(value * 100);
                if (roundedValue > 0) {
                    output += `${symbol}: ${roundedValue}%\n`;
                }
            }
        );
        return output + '\n\n' + DIVIDER + '\n\n';
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

        // Check if we're between 3:50pm (15:50) and 4:00pm (16:00)
        if (hours === 15 && minutes >= 50) {
            return true;
        }
        if (hours === 16 && minutes === 0) {
            return true;
        }

        return false;
    }
}
