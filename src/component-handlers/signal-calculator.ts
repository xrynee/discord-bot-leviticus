import { ComponentInteraction, Interaction } from 'eris';

import { COMPONENT_IDS, FILES } from '../config';
import { SignalUserConfig } from '../commands/signal-config';
import { IComponentHandler } from '../interface';
import { LocalStorage } from '../util';

export class SignalCalculator implements IComponentHandler {
    public async handle(interaction: Interaction): Promise<void> {
        const customId = (interaction as any).data.custom_id;

        if (customId.startsWith(COMPONENT_IDS.SIGNAL_MODAL)) {
            await this.handleModalSubmit(interaction);
        } else {
            await this.handleButtonClick(interaction as unknown as ComponentInteraction);
        }
    }

    private async handleButtonClick(interaction: ComponentInteraction): Promise<void> {
        // custom_id format: signal-calculate:{signalId}:{signalValue}
        const parts = interaction.data.custom_id.split(':');
        const signalId = parts[1];
        const signalValue = parts[2];

        // Load saved defaults if available
        const userId = interaction.member?.id || interaction.user?.id;
        let defaultAccountValue = '';
        let defaultLeverage = '2';
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
                    title: `Calculate Position - ${signalId}`,
                    custom_id: `${COMPONENT_IDS.SIGNAL_MODAL}:${signalId}:${signalValue}`,
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
                                    label: 'Max Leverage',
                                    style: 1, // Short
                                    placeholder: '2',
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
        // custom_id format: signal-modal:{signalId}:{signalValue}
        const parts = (interaction as any).data.custom_id.split(':');
        const signalId = parts[1];
        const signalValue = parseFloat(parts[2]);

        // Modal submit data comes in interaction.data.components
        const components = ((interaction as any).data as any).components as any[];
        const fields: any[] = [].concat(...components.map((row: any) => row.components));
        const accountValue = parseFloat(
            fields.find((c: any) => c.custom_id === 'account_value')?.value || '0'
        );
        const maxLeverage = parseFloat(
            fields.find((c: any) => c.custom_id === 'max_leverage')?.value || '2'
        );

        if (isNaN(accountValue) || isNaN(maxLeverage) || isNaN(signalValue)) {
            await (interaction as any).createMessage({
                content: 'Invalid input. Please enter valid numbers.',
                flags: 64
            });
            return;
        }

        // Signal is 0-1, each signal is half the portfolio, then multiply by leverage
        const positionSize = accountValue * maxLeverage * signalValue * 0.5;

        const fmt = (n: number) =>
            n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const response = [
            `**${signalId} - Position Calculator**`,
            ``,
            `Signal: ${signalValue}`,
            `Account Value: $${fmt(accountValue)}`,
            `Max Leverage: ${maxLeverage}x`,
            ``,
            `**Invest: $${fmt(positionSize)}**`
        ].join('\n');

        await (interaction as any).createMessage({
            content: response,
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
