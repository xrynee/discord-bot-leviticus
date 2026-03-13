import { ApplicationCommand, Client, CommandInteraction, Constants } from 'eris';

import { COMMANDS, FILES } from '../config';
import { ICommand } from '../interface';
import { LocalStorage } from '../util';

export interface SignalUserConfig {
    accountValue: number;
    maxLeverage: number;
}

export class SignalConfig implements ICommand {
    private cmd: ApplicationCommand;

    public async create(client: Client) {
        this.cmd = await client.createCommand({
            name: COMMANDS.SIGNAL_CONFIG,
            description: 'Set default account value and max leverage for signal calculations.',
            options: [
                {
                    name: 'account_value',
                    description: 'Your account value in dollars',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: true
                },
                {
                    name: 'max_leverage',
                    description: 'Your max leverage (default: 2)',
                    type: Constants.ApplicationCommandOptionTypes.NUMBER,
                    required: false
                }
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const accountValue = (interaction.data.options?.[0] as any)?.value as number;
        const maxLeverage = ((interaction.data.options?.[1] as any)?.value as number) || 2;

        const userId = interaction.member?.id || interaction.user?.id;
        if (!userId) {
            await interaction.createMessage({ content: 'Could not identify user.', flags: 64 });
            return;
        }

        const config: SignalUserConfig = { accountValue, maxLeverage };
        await LocalStorage.set(`${FILES.SIGNAL_CONFIG}-${userId}`, config);

        await interaction.createMessage({
            content: `Defaults saved!\nAccount Value: $${accountValue.toLocaleString()}\nMax Leverage: ${maxLeverage}x\n\nThese will pre-fill the modal when you click "Calculate Position".`,
            flags: 64
        });
    }

    public isHandledBy(event: CommandInteraction): boolean {
        return event.data.name === this.cmd.name;
    }
}
