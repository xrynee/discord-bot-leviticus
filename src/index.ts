import eris, { Constants, Message } from 'eris';

import { COMMANDS, ensureCommands } from './commands';
import { COMPONENT_HANDLERS } from './component-handlers';
import { FILES } from './config';
import { init } from './messages';
import { LvGame } from './messages/clear-game-cache';
import { Environment, EnvKey, Global, LocalStorage } from './util';

Environment.init();

const botToken = Environment.get(EnvKey.DISCORD_BOT_TOKEN);

console.log('botToken', botToken);

const bot = new eris.Client(botToken, {
    restMode: true,
    intents: [Constants.Intents.all]
});

bot.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    if (message.content?.toLowerCase().includes('twitch.tv/')) {
        const userId = message.author.id;

        const gameCache: LvGame[] = (await LocalStorage.get(FILES.GAME_CACHE)) || [];
        const game = gameCache.find(g => g.userId === userId);
        if (!!game) {
            game.isDone = true;
        } else {
            gameCache.push({ userId, isDone: true });
        }
        await LocalStorage.set(FILES.GAME_CACHE, gameCache);

        await Global.refresh(message.guildID);
    }

    if (message.content === 'ping') {
        message.channel.createMessage('pong');
    }
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
