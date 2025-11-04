// Import necessary libraries
import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';

import 'isomorphic-fetch'; // Polyfill for the fetch API
import { Environment, EnvKey } from '../util';

// --- Your Discord Bot Setup Would Be Here ---
// import { Client as DiscordClient, GatewayIntentBits } from 'discord.js';
// const discordClient = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });
// ...

// --- Microsoft Graph Setup ---

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

const cca = new msal.ConfidentialClientApplication(msalConfig);
const SENDER_EMAIL = 'noreply@demeter-funds.com'; // The email address you're watching for\
const SUBJECT = '[DEV] Demeter Signals';

/**
 * Gets an authentication token for the Graph API
 */
async function getGraphToken() {
    const tokenRequest = {
        scopes: ['https://graph.microsoft.com/.default'] // Scope for app permissions
    };
    try {
        const response = await cca.acquireTokenByClientCredential(tokenRequest);
        return response.accessToken;
    } catch (error) {
        console.error('Error acquiring token:', error);
        return null;
    }
}

/**
 * Uses the token to create an authenticated Graph API client
 */
async function getGraphClient() {
    const accessToken = await getGraphToken();
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

/**
 * Checks for new, unread emails from the specific sender
 */
async function checkDailyEmail() {
    try {
        const client = await getGraphClient();

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

// --- Run the bot ---
// discordClient.login("YOUR_DISCORD_TOKEN");
// discordClient.on('ready', () => {
//    console.log(`Discord bot logged in as ${discordClient.user.tag}!`);
//
//    // Start polling for emails every 5 minutes (300,000 milliseconds)
//    checkDailyEmail(); // Check once on startup
//    setInterval(checkDailyEmail, 300000);
// });
