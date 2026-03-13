import {
    ApplicationCommand,
    ApplicationCommandStructure,
    Client,
    CommandInteraction,
    ComponentInteraction,
    Constants
} from 'eris';

import { COMMANDS, FILES } from '../config';
import { ICommand } from '../interface';
import { Global, LocalStorage } from '../util';

export class LeviInit implements ICommand {
    private client: Client;
    private cmd: ApplicationCommand;

    public getDefinition(): ApplicationCommandStructure {
        return {
            name: COMMANDS.LEVI_INIT,
            description: 'Initialize the Levi bot in this channel.',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        };
    }

    public create(client: Client, cmd: ApplicationCommand) {
        this.client = client;
        this.cmd = cmd;
    }

    public async handle(interaction: ComponentInteraction): Promise<void> {
        LocalStorage.set(FILES.CHANNEL, interaction.channel.id);

        await interaction.createMessage(
            'Levi bot initialized in this channel. Channel ID: ' + interaction.channel.id
        );

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: CommandInteraction): boolean {
        return client.data.name === this.cmd.name;
    }
}
