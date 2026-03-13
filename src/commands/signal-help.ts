import { ApplicationCommand, Client, CommandInteraction, Constants } from 'eris';

import { COMMANDS } from '../config';
import { ICommand } from '../interface';

export class SignalHelp implements ICommand {
    private cmd: ApplicationCommand;

    public async create(client: Client) {
        this.cmd = await client.createCommand({
            name: COMMANDS.SIGNAL_HELP,
            description: 'Explains how the signal bot and position calculator work.',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        });
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const message = [
            '**Signal Bot - How It Works**',
            '',
            'This bot watches for trading signals (POT_SPX and POT_NDX) near market close and posts them to this channel.',
            '',
            '**Signals**',
            'Each signal is a value from 0 to 1 representing a leverage percentage. Since there are 2 signals, each one accounts for half of your portfolio.',
            '',
            '**Calculate Position**',
            'Each signal message has a "Calculate Position" button. Click it to open a form where you enter:',
            '- **Account Value** — your total account size in dollars',
            '- **Max Leverage** — your maximum leverage multiplier (default: 2)',
            '',
            'The formula is: `Account Value x Max Leverage x Signal x 0.5`',
            '',
            'For example, with a $10,000 account, 2x leverage, and a signal of 0.8:',
            '`$10,000 x 2 x 0.8 x 0.5 = $8,000` to invest in that symbol.',
            '',
            '**Save Defaults (Optional)**',
            'Use `/signal-config` to save your account value and max leverage. These will pre-fill the form so you don\'t have to type them every time. You can always change them before submitting.',
            '',
            'Only you can see your calculation results and saved config.'
        ].join('\n');

        await interaction.createMessage({
            content: message,
            flags: 64 // Ephemeral
        });
    }

    public isHandledBy(event: CommandInteraction): boolean {
        return event.data.name === this.cmd.name;
    }
}
