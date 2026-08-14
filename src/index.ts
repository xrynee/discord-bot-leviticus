import eris, { Constants, Message } from 'eris';

import { COMMANDS, ensureCommands } from './commands';
import { COMPONENT_HANDLERS } from './component-handlers';
// import { FILES } from './config';
import { init } from './messages';
// import { LvGame } from './messages/clear-game-cache';
import { startServices } from './service';
import { Environment, EnvKey } from './util';

Environment.init();

const botToken = Environment.get(EnvKey.DISCORD_BOT_TOKEN);

// Never log the token itself — pm2 keeps these logs on disk.
console.log(botToken ? 'Bot token loaded' : 'Bot token MISSING from .env');

const bot = new eris.Client(botToken, {
    restMode: false,
    intents: [Constants.Intents.guildMessages]
});

// Discord routinely closes the gateway (code 1001 "going away") and Eris surfaces that as an
// error event. Node throws on an unhandled 'error' emit, which kills the process and makes pm2
// restart the bot; logging it instead lets Eris reconnect on its own.
bot.on('error', (error: Error, shardId?: number) => {
    console.error(`Gateway error${shardId === undefined ? '' : ` on shard ${shardId}`}:`, error);
});

bot.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        message.channel.createMessage('pong');
    }
});

bot.on('ready', () => {
    // Unawaited, so without this catch a failed registration is a silent unhandled rejection
    // and the bot keeps serving whatever command set Discord already had.
    ensureCommands(bot).catch(error => console.error('Failed to register commands:', error));
    init(bot);
    startServices(bot);
    console.log('Bot is ready');
});

bot.on('interactionCreate', event => {
    if (event instanceof eris.CommandInteraction) {
        const command = COMMANDS.find(c => c.isHandledBy(event));
        command?.handle(event);
    } else if (event instanceof eris.ComponentInteraction) {
        const handler = COMPONENT_HANDLERS.find(c => c.isHandledBy(event));
        handler?.handle(event);
    } else if ((event as any).data?.custom_id) {
        // Modal submits arrive as UnknownInteraction in Eris 0.17.x
        const handler = COMPONENT_HANDLERS.find(c =>
            c.isHandledBy(event as unknown as eris.ComponentInteraction)
        );
        handler?.handle(event);
    }
});

bot.connect();
