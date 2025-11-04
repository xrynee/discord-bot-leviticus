// Import necessary libraries
import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';

import 'isomorphic-fetch'; // Polyfill for the fetch API
import Eris from 'eris';

import { FILES } from '../config';
import { IService } from '../interface';
import { Environment, EnvKey, LocalStorage } from '../util';

// --- Microsoft Graph Setup ---
const SENDER_EMAIL = 'noreply@demeter-funds.com'; // The email address you're watching for\
const SUBJECT = '[DEV] Demeter Signals';

export class EmailWatcherService implements IService {
    private bot: Eris.Client;
    private cca: msal.ConfidentialClientApplication;

    constructor(bot: Eris.Client) {
        this.bot = bot;
        const clientSecret = Environment.get(EnvKey.EMAIL_CLIENT_SECRET);
        const clientId = Environment.get(EnvKey.EMAIL_CLIENT_ID);
        const tenantId = Environment.get(EnvKey.EMAIL_TENANT_ID);
        const msalConfig = {
            auth: {
                clientId,
                authority: `https://login.microsoftonline.com/${tenantId}`,
                clientSecret
            }
        };

        this.cca = new msal.ConfidentialClientApplication(msalConfig);
    }

    async checkDailyEmail() {
        try {
            const client = await this.getGraphClient();

            // This is the user's email you are watching
            // Make sure this user exists in your Azure/Microsoft tenant
            const userToWatch = 'rwt@demeter-funds.com';

            const messages = await client
                .api(`/users/${userToWatch}/messages`)
                .filter(
                    `from/emailAddress/address eq '${SENDER_EMAIL}' and subject eq '${SUBJECT}' and isRead eq false`
                )
                .select('subject,body,from') // Select only the fields you need
                .top(1) // We only care about the latest one
                .get();

            if (messages.value.length > 0) {
                const email = messages.value[0];
                console.log(`New email found! Subject: ${email.subject}`);

                // Extract the content
                // 'body.content' will be HTML or text. 'body.contentType' tells you which.
                const emailContent = email.body.content;
                console.log(`Email content type: ${email.body.contentType}`);
                console.log(`Email content: ${emailContent}`);

                const channelId: string = await LocalStorage.get(FILES.CHANNEL);
                await this.bot.createMessage(channelId, emailContent);

                // --- 1. POST TO DISCORD ---
                // Find your channel and send the message
                // const channel = await discordClient.channels.fetch("YOUR_CHANNEL_ID");
                // if (channel.isTextBased()) {
                //    channel.send(`**${email.subject}**\n\n${emailContent}`);
                // }

                // --- 2. MARK AS READ ---
                // Mark the email as read so we don't process it again
                // await client.api(`/users/${userToWatch}/messages/${email.id}`)
                //     .update({ isRead: true });

                console.log('Posted to Discord and marked as read.');
            } else {
                console.log('No new daily email found.');
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }
    }

    public async start(): Promise<void> {
        let pollingInterval: NodeJS.Timeout | null = null;

        let hasRunOnce = false;

        const checkAndPoll = async () => {
            const inWindow = this.isInPollingWindow();

            if (inWindow || !hasRunOnce) {
                hasRunOnce = true;
                // We're in the polling window, poll every 10 seconds
                if (!pollingInterval) {
                    console.log(
                        'Entered email polling window (3:50pm-4pm EST). Starting frequent polling...'
                    );
                    await this.checkDailyEmail(); // Check immediately
                    pollingInterval = setInterval(async () => {
                        await this.checkDailyEmail();
                    }, 10000); // Every 10 seconds
                }
            } else {
                // We're outside the window, stop frequent polling
                if (pollingInterval) {
                    console.log('Exited email polling window. Stopping frequent polling.');
                    clearInterval(pollingInterval);
                    pollingInterval = null;
                }
            }
        };

        // Check every minute to see if we've entered the window
        await checkAndPoll(); // Check immediately on startup
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

    private async getGraphToken() {
        const tokenRequest = {
            scopes: ['https://graph.microsoft.com/.default'] // Scope for app permissions
        };
        try {
            const response = await this.cca.acquireTokenByClientCredential(tokenRequest);
            return response.accessToken;
        } catch (error) {
            console.error('Error acquiring token:', error);
            return null;
        }
    }

    private async getGraphClient() {
        const accessToken = await this.getGraphToken();
        if (!accessToken) {
            throw new Error('Could not get access token');
        }

        const client = Client.init({
            authProvider: done => {
                done(null, accessToken); // Provide the acquired token
            }
        });
        return client;
    }
}
