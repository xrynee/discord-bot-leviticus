import { ApplicationCommand, Client, CommandInteraction, Constants } from 'eris';

import { COMMANDS, FILES } from '../config';
import { ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class CfbInit implements ICommand {
    private client: Client;
    private cmd: ApplicationCommand;

    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: COMMANDS.INIT,
            description: 'Set the current channel as the current week progress channel',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const channelId = interaction.channel.id;

        await LocalStorage.set(FILES.CHANNEL_ID, channelId);

        await interaction.defer();
        await interaction.deleteOriginalMessage();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: CommandInteraction): boolean {
        return client.data.name === this.cmd.name;
    }
}
