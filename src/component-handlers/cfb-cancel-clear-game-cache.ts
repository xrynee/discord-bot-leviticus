import { ComponentInteraction } from 'eris';

import { COMPONENT_IDS, FILES } from '../config';
import { IComponentHandler } from '../interface';
import { Global, LocalStorage } from '../util';

export class CfbCancelClearGameCache implements IComponentHandler {
    public async handle(interaction: ComponentInteraction): Promise<void> {
        await LocalStorage.set(FILES.CLEAR_STEP_2, 'false');

        await interaction.acknowledge();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: ComponentInteraction): boolean {
        return client.data.custom_id === COMPONENT_IDS.CANCEL_CLEAR_GAME_CACHE;
    }
}
