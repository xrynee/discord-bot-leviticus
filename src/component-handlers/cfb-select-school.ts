import { ComponentInteraction } from 'eris';

import { COMPONENT_IDS, FILES } from '../config';
import { IComponentHandler } from '../interface';
import { LocalStorage } from '../util';

export class CfbSelectSchool implements IComponentHandler {
    public async handle(interaction: ComponentInteraction): Promise<void> {
        const values: any[] = (interaction.data as any)?.values;
        if (!!values?.length) {
            await LocalStorage.set(FILES.SELECTED_SCHOOL, values?.[0]);
        }
        await interaction.acknowledge();

        // await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: ComponentInteraction): boolean {
        return client.data.custom_id === COMPONENT_IDS.SELECT_SCHOOL;
    }
}
