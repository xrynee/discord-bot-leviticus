import 'isomorphic-fetch'; // Polyfill for the fetch API
import Eris from 'eris';

import { COMPONENT_IDS, DIVIDER, FILES } from '../config';
import { IService, PotentialSignal } from '../interface';
import { DataSignalClient, Environment, EnvKey, LocalStorage } from '../util';

interface SignalResult {
    signalId: string;
    signal: number;
}

export class SignalWatcherService implements IService {
    private bot: Eris.Client;
    // private db: Db;
    private signalClient: DataSignalClient;
    private isAlwaysPollingWindow: boolean;

    constructor(bot: Eris.Client) {
        this.bot = bot;
        // this.db = new Db();
        this.signalClient = new DataSignalClient();
        this.isAlwaysPollingWindow = Environment.getBoolean(EnvKey.IS_ALWAYS_POLLING_WINDOW);
    }

    async checkHistory() {
        const signalIds = [
            {
                signalId: 'POT_SPX',
                historyKey: FILES.LAST_SIGNAL_DATE_SPX
            },
            {
                signalId: 'POT_NDX',
                historyKey: FILES.LAST_SIGNAL_DATE_NDX
            }
        ];

        const newSignals: SignalResult[] = [];

        for (const config of signalIds) {
            try {
                const todayDt =
                    Environment.get(EnvKey.DT_OVERRIDE) || new Date().toISOString().split('T')[0];
                const signalResponse = await this.signalClient.getLatest(todayDt, config.signalId);

                const lastDate = +(await LocalStorage.get(config.historyKey));
                if (new Date(signalResponse.date) > new Date(lastDate)) {
                    await LocalStorage.set(config.historyKey, signalResponse.date);
                    const signalData = JSON.parse(signalResponse.signalData) as PotentialSignal;
                    newSignals.push({
                        signalId: config.signalId,
                        signal: signalData.LeveragePercentage
                    });
                } else {
                    console.log(`No new signal for ${config.signalId}.`);
                }
            } catch (error) {
                console.error(`Error checking signal ${config.signalId}:`, error);
            }
        }

        if (newSignals.length === 0) return;

        const channelId: string = await LocalStorage.get(FILES.CHANNEL);

        // Remove button from previous signal message
        await this.removePreviousButton();

        // Send combined message with one button
        const messageContent = this.buildMessage(newSignals);
        const sent = await this.bot.createMessage(channelId, messageContent);

        // Store this message ID so we can remove its button next time
        await LocalStorage.set(FILES.LAST_SIGNAL_MESSAGE, {
            channelId,
            messageId: sent.id
        });
    }

    private async removePreviousButton(): Promise<void> {
        try {
            const prev = await LocalStorage.get<{ channelId: string; messageId: string }>(
                FILES.LAST_SIGNAL_MESSAGE
            );
            if (prev?.messageId) {
                const msg = await this.bot.getMessage(prev.channelId, prev.messageId);
                if (msg) {
                    await this.bot.editMessage(prev.channelId, prev.messageId, {
                        content: msg.content,
                        components: []
                    });
                }
            }
        } catch (error) {
            // Previous message may have been deleted, ignore
            console.log('Could not remove previous button:', error);
        }
    }

    private buildMessage(signals: SignalResult[]): Eris.AdvancedMessageContent {
        const lines = signals.map(s => `**${s.signalId}**: ${s.signal}`);
        const content = `**New Signals**\n\n${lines.join('\n')}\n\n${DIVIDER}`;

        // Encode all signals in the button custom_id as signalId=value pairs
        const signalData = signals.map(s => `${s.signalId}=${s.signal}`).join(',');

        return {
            content,
            components: [
                {
                    type: 1, // ActionRow
                    components: [
                        {
                            type: 2, // Button
                            style: 1, // Primary
                            label: 'Calculate Position',
                            custom_id: `${COMPONENT_IDS.SIGNAL_CALCULATE}:${signalData}`
                        }
                    ]
                }
            ]
        };
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
                    await this.checkHistory(); // Check immediately
                    pollingInterval = setInterval(async () => {
                        await this.checkHistory();
                    }, 5000); // Every 5 seconds
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

        await this.checkHistory(); // Check immediately for a new weight

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
        if ((hours === 15 || hours === 12) && minutes >= 59) {
            return true;
        }
        if (hours === 16 && minutes === 0) {
            return true;
        }

        return false;
    }
}
