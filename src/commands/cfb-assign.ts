import {
    ApplicationCommand,
    Client,
    CommandInteraction,
    Constants,
    InteractionDataOptionsWithValue
} from 'eris';

import { COMMANDS, FILES, SCHOOLS } from '../config';
import { ICommand, SchoolAssignment } from '../interface';
import { Global, LocalStorage } from '../util';

export class CfbAssign implements ICommand {
    private client: Client;
    private cmd: ApplicationCommand;
    public async create(client: Client) {
        this.client = client;

        this.cmd = await client.createCommand({
            name: COMMANDS.ASSIGN,
            description: 'Assign a discord user to a school.',
            options: [
                {
                    name: 'user',
                    description: 'The user to assign',
                    type: Constants.ApplicationCommandOptionTypes.USER,
                    required: true
                } as any,
                {
                    name: 'school',
                    description: 'The team to assign the user to (Will overwrite existing)',
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT,
            defaultPermission: false
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const options: InteractionDataOptionsWithValue[] = interaction.data.options as any;

        const userId = options.find(o => o.name === 'user').value.toString();
        const schoolName = options.find(o => o.name === 'school').value.toString();

        const schoolId = SCHOOLS.find(s => s.name?.toLowerCase() === schoolName?.toLowerCase())?.id;

        if (!schoolId || !userId) {
            // school not found

            await interaction.defer();
            await interaction.deleteOriginalMessage();
            return;
        }

        const assignments: SchoolAssignment[] = (await LocalStorage.get(FILES.ASSIGNMENTS)) || [];

        const filteredAssignments = assignments.filter(
            a => a.userId !== userId && a.schoolId !== schoolId
        );
        filteredAssignments.push({ userId, schoolId });

        await LocalStorage.set(FILES.ASSIGNMENTS, filteredAssignments);

        await interaction.defer();
        await interaction.deleteOriginalMessage();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: CommandInteraction): boolean {
        return client.data.name === this.cmd.name;
    }
}
