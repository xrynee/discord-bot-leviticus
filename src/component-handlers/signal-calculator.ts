import { ComponentInteraction, Interaction } from 'eris';

import { SignalUserConfig } from '../commands/signal-config';
import { COMPONENT_IDS, FILES } from '../config';
import { IComponentHandler } from '../interface';
import { LocalStorage } from '../util';

interface ParsedSignal {
    signalId: string;
    signal: number;
}

const ETF_MAP: Record<string, { base: string; leveraged: string }> = {
    POT_SPX: { base: 'SPY', leveraged: 'SPXL' },
    POT_NDX: { base: 'QQQ', leveraged: 'TQQQ' }
};

export class SignalCalculator implements IComponentHandler {
    public async handle(interaction: Interaction): Promise<void> {
        const customId = (interaction as any).data.custom_id;

        if (customId.startsWith(COMPONENT_IDS.SIGNAL_MODAL)) {
            await this.handleModalSubmit(interaction);
        } else {
            await this.handleButtonClick(interaction as unknown as ComponentInteraction);
        }
    }

    private parseSignals(encodedSignals: string): ParsedSignal[] {
        // Format: POT_SPX=0.8,POT_NDX=0.6
        return encodedSignals.split(',').map(pair => {
            const [signalId, value] = pair.split('=');
            return { signalId, signal: parseFloat(value) };
        });
    }

    private async handleButtonClick(interaction: ComponentInteraction): Promise<void> {
        // custom_id format: signal-calculate:{signalData}
        const signalData = interaction.data.custom_id.substring(
            COMPONENT_IDS.SIGNAL_CALCULATE.length + 1
        );

        // Load saved defaults if available
        const userId = interaction.member?.id || interaction.user?.id;
        let defaultAccountValue = '';
        let defaultLeverage = '3';
        if (userId) {
            const config = await LocalStorage.get<SignalUserConfig>(
                `${FILES.SIGNAL_CONFIG}-${userId}`
            );
            if (config) {
                defaultAccountValue = config.accountValue.toString();
                defaultLeverage = config.maxLeverage.toString();
            }
        }

        // Use raw createInteractionResponse to show a modal (type 9)
        await (interaction as any)._client.createInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: 9, // MODAL
                data: {
                    title: 'Calculate Position',
                    custom_id: `${COMPONENT_IDS.SIGNAL_MODAL}:${signalData}`,
                    components: [
                        {
                            type: 1, // ActionRow
                            components: [
                                {
                                    type: 4, // TextInput
                                    custom_id: 'account_value',
                                    label: 'Account Value ($)',
                                    style: 1, // Short
                                    placeholder: '10000',
                                    value: defaultAccountValue || undefined,
                                    required: true
                                }
                            ]
                        },
                        {
                            type: 1, // ActionRow
                            components: [
                                {
                                    type: 4, // TextInput
                                    custom_id: 'max_leverage',
                                    label: 'Max Leverage (up to 3)',
                                    style: 1, // Short
                                    placeholder: '3',
                                    value: defaultLeverage,
                                    required: true
                                }
                            ]
                        }
                    ]
                }
            }
        );
    }

    private async handleModalSubmit(interaction: Interaction): Promise<void> {
        // custom_id format: signal-modal:{signalData}
        const signalData = (interaction as any).data.custom_id.substring(
            COMPONENT_IDS.SIGNAL_MODAL.length + 1
        );
        const signals = this.parseSignals(signalData);

        // Parse form fields
        const components = ((interaction as any).data as any).components as any[];
        const fields: any[] = [].concat(...components.map((row: any) => row.components));
        const accountValue = parseFloat(
            fields.find((c: any) => c.custom_id === 'account_value')?.value || '0'
        );
        const maxLeverage = Math.min(
            3,
            parseFloat(fields.find((c: any) => c.custom_id === 'max_leverage')?.value || '3')
        );

        if (isNaN(accountValue) || isNaN(maxLeverage)) {
            await (interaction as any).createMessage({
                content: 'Invalid input. Please enter valid numbers.',
                flags: 64
            });
            return;
        }

        const fmt = (n: number) =>
            n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const lines: string[] = [
            '**Position Calculator**',
            '',
            `Account Value: $${fmt(accountValue)}`,
            `Max Leverage: ${maxLeverage}x`,
            ''
        ];

        for (const s of signals) {
            const etfs = ETF_MAP[s.signalId] || { base: s.signalId, leveraged: s.signalId };
            const capital = accountValue * 0.5;
            const effectiveLeverage = maxLeverage * s.signal;

            if (effectiveLeverage <= 2) {
                // Achievable with base ETF on margin alone
                const buyBase = capital * effectiveLeverage;
                lines.push(
                    `**${s.signalId}** (Signal: ${s.signal})`,
                    `  Buy **$${fmt(buyBase)}** of ${etfs.base}`,
                    ''
                );
            } else {
                // Need a mix: maximize base ETF on 2x margin, fill remainder with 3x ETF
                // Capital split: a (base) + b (leveraged) = 1
                // Exposure: 2a + 3b = effectiveLeverage
                // a = 3 - effectiveLeverage, b = effectiveLeverage - 2
                const fractionBase = 3 - effectiveLeverage;
                const fractionLeveraged = effectiveLeverage - 2;
                const buyBase = fractionBase * capital * 2;
                const buyLeveraged = fractionLeveraged * capital;

                lines.push(
                    `**${s.signalId}** (Signal: ${s.signal})`,
                    `  Buy **$${fmt(buyBase)}** of ${etfs.base}`,
                    `  Buy **$${fmt(buyLeveraged)}** of ${etfs.leveraged}`,
                    ''
                );
            }
        }

        await (interaction as any).createMessage({
            content: lines.join('\n'),
            flags: 64 // Ephemeral
        });
    }

    public isHandledBy(event: ComponentInteraction): boolean {
        return (
            event.data.custom_id.startsWith(COMPONENT_IDS.SIGNAL_CALCULATE) ||
            event.data.custom_id.startsWith(COMPONENT_IDS.SIGNAL_MODAL)
        );
    }
}
