import { ComponentInteraction } from 'eris';

import { COMPONENT_IDS, FILES } from '../config';
import { IComponentHandler } from '../interface';
import { Global, LocalStorage } from '../util';

export class CfbClearGameCache implements IComponentHandler {
    public async handle(interaction: ComponentInteraction): Promise<void> {
        const isOnStep2 = (await LocalStorage.get(FILES.CLEAR_STEP_2)) === 'true';

        if (isOnStep2) {
            await LocalStorage.set(FILES.GAME_CACHE, []);
            await LocalStorage.set(FILES.CLEAR_STEP_2, 'false');
        } else {
            await LocalStorage.set(FILES.CLEAR_STEP_2, 'true');
        }

        await interaction.acknowledge();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: ComponentInteraction): boolean {
        return client.data.custom_id === COMPONENT_IDS.CLEAR_GAME_CACHE;
    }
}
