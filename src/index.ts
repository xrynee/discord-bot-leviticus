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

console.log('botToken', botToken);

const bot = new eris.Client(botToken, {
    restMode: false,
    intents: [Constants.Intents.guildMessages]
});

bot.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        message.channel.createMessage('pong');
    }
});

bot.on('ready', () => {
    ensureCommands(bot);
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
