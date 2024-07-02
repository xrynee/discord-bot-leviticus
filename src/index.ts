import eris, { Constants } from 'eris';

import { ensureCommands, onEvent } from './commands';
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

bot.on('interactionCreate', interaction => {
    onEvent(interaction);
});

bot.connect();
