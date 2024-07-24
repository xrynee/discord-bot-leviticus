import eris, { Constants } from 'eris';

import { COMMANDS, ensureCommands } from './commands';
import { COMPONENT_HANDLERS } from './component-handlers';
import { init } from './messages';
import { Environment, EnvKey } from './util';

Environment.init();

const botToken = Environment.get(EnvKey.DISCORD_BOT_TOKEN);

console.log('botToken', botToken);

const bot = new eris.Client(botToken, {
    restMode: true,
    intents: [Constants.Intents.all]
});

bot.on('ready', () => {
    ensureCommands(bot);
    init(bot);
});

bot.on('interactionCreate', event => {
    if (event instanceof eris.CommandInteraction) {
        const command = COMMANDS.find(c => c.isHandledBy(event));
        command?.handle(event);
    } else if (event instanceof eris.ComponentInteraction) {
        const handler = COMPONENT_HANDLERS.find(c => c.isHandledBy(event));
        handler?.handle(event);
    }
});

bot.connect();
