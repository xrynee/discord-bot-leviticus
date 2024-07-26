import {
    ApplicationCommand,
    Client,
    CommandInteraction,
    Constants,
    InteractionDataOptionsWithValue
} from 'eris';

import { COMMANDS, FILES } from '../config';
import { ICommand } from '../interface';
import { LvGame } from '../messages/clear-game-cache';
import { Global, LocalStorage } from '../util';

export class TwitchCommand implements ICommand {
    private client: Client;
    private cmd: ApplicationCommand;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: COMMANDS.TWITCH,
            description: 'Conveniently build the twitch url with your username',
            options: [
                {
                    name: 'username',
                    description: 'Your twitch username. (Only required the first time)',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: false
                }
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const options: InteractionDataOptionsWithValue[] = interaction.data.options as any;
        const userId = interaction.member.user.id;

        let username = options.find(o => o.name === 'username')?.value?.toString();

        if (!username) {
            username = await LocalStorage.get(FILES.TWITCH_ROOT + userId);

            if (!username) {
                await interaction.channel.createMessage('Please provide your twitch username.');

                await interaction.defer();
                await interaction.deleteOriginalMessage();

                return;
            }
        } else {
            await LocalStorage.set(FILES.TWITCH_ROOT + userId, username);
        }

        await interaction.channel.createMessage(`https://twitch.tv/${username}`);

        const gameCache: LvGame[] = (await LocalStorage.get(FILES.GAME_CACHE)) || [];
        const game = gameCache.find(g => g.userId === userId);
        if (!!game) {
            game.isDone = true;
        } else {
            gameCache.push({ userId, isDone: true });
        }
        await LocalStorage.set(FILES.GAME_CACHE, gameCache);

        await interaction.defer();
        await interaction.deleteOriginalMessage();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: CommandInteraction): boolean {
        return client.data.name === this.cmd.name;
    }
}
