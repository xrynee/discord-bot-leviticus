import {
    ApplicationCommand,
    Client,
    CommandInteraction,
    ComponentInteraction,
    Constants
} from 'eris';

import { ICommand } from '../interface';
import { Global } from '../util';

export class CbaAccept implements ICommand {
    private client: Client;
    private cmd: ApplicationCommand;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: 'cba-accept',
            description: 'Accept the CBA and get access to the server.',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        });
    }

    public async handle(interaction: ComponentInteraction): Promise<void> {
        const roleName = 'Player';

        const roles = await this.client.getRESTGuildRoles(interaction.guildID);
        const role = roles?.find(r => r.name === roleName);

        if (!interaction.member.roles.includes(role.id)) {
            await interaction.member.addRole(role.id);
        }

        await interaction.defer();
        await interaction.deleteOriginalMessage();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: CommandInteraction): boolean {
        return client.data.name === this.cmd.name;
    }
}
