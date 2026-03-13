import {
    ApplicationCommand,
    ApplicationCommandStructure,
    Client,
    CommandInteraction,
    Constants
} from 'eris';

import { COMMANDS } from '../config';
import { ICommand } from '../interface';

export class SignalHelp implements ICommand {
    private cmd: ApplicationCommand;

    public getDefinition(): ApplicationCommandStructure {
        return {
            name: COMMANDS.SIGNAL_HELP,
            description: 'Explains how the signal bot and position calculator work.',
            options: [],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        };
    }

    public create(_client: Client, cmd: ApplicationCommand) {
        this.cmd = cmd;
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
            '**ETF Mapping**',
            '- POT_SPX → SPY (1x) / SPXL (3x)',
            '- POT_NDX → QQQ (1x) / TQQQ (3x)',
            '',
            '**Calculate Position**',
            'Each signal message has a "Calculate Position" button. Click it to enter:',
            '- **Account Value** — your total account size in dollars',
            '- **Max Leverage** — up to 3x (default: 3)',
            '',
            '**How the calculation works**',
            'Target exposure per signal = `Account Value x 0.5 x Max Leverage x Signal`',
            '',
            'If effective leverage (Max Leverage x Signal) is **2x or less**:',
            '→ Buy the base ETF (SPY/QQQ) on margin.',
            '',
            'If effective leverage is **above 2x** (up to 3x):',
            '→ Buy as much of the base ETF on 2x margin as possible.',
            '→ Use the 3x ETF (SPXL/TQQQ) for the remainder, minimizing its use.',
            '',
            '**Example**: $10,000 account, 3x leverage, POT_SPX signal of 0.8',
            'Capital per signal: $5,000 | Effective leverage: 2.4x',
            'Since 2.4x > 2x, we split:',
            '→ Buy **$6,000** of SPY (60% of capital on 2x margin)',
            '→ Buy **$2,000** of SPXL (40% of capital, 3x exposure)',
            'Total exposure: $6,000 + $6,000 = $12,000 = $5,000 x 2.4x',
            '',
            '**Why SPY over SPXL?**',
            'Leveraged ETFs like SPXL/TQQQ suffer from **volatility decay** — daily rebalancing erodes returns over time, especially in choppy markets. A 3x ETF does not return 3x over periods longer than a day. They also have **higher expense ratios** and wider bid-ask spreads. Using SPY/QQQ on margin gives you clean, predictable leverage without the drag. We only use SPXL/TQQQ when margin alone cannot reach the target exposure.',
            '',
            '**Save Defaults (Optional)**',
            "Use `/signal-config` to save your account value and max leverage. These will pre-fill the form so you don't have to type them every time.",
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
