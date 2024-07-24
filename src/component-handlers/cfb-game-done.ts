import { ComponentInteraction } from 'eris';

import { COMPONENT_IDS, FILES } from '../config';
import { SchoolId } from '../enum';
import { IComponentHandler, SchoolAssignment } from '../interface';
import { LvGame } from '../messages/current-schedule';
import { Global, LocalStorage } from '../util';

export class CfbGameDone implements IComponentHandler {
    public async handle(interaction: ComponentInteraction): Promise<void> {
        const gameCache: LvGame[] = (await LocalStorage.get(FILES.GAME_CACHE)) || [];
        const assignments: SchoolAssignment[] = (await LocalStorage.get(FILES.ASSIGNMENTS)) || [];

        const schoolSelect = +(await LocalStorage.get(FILES.SELECTED_SCHOOL));

        const userId = assignments.find(a => a.schoolId === (+schoolSelect as SchoolId))?.userId;
        if (!userId) {
            console.log('no user id found');
            return;
        }
        const game = gameCache.find(g => g.userId === userId);

        if (!!game) {
            game.isDone = true;
        } else {
            gameCache.push({ userId, isDone: true });
        }

        await LocalStorage.set(FILES.GAME_CACHE, gameCache);

        await interaction.acknowledge();

        await Global.refresh(interaction.guildID);
    }

    public isHandledBy(client: ComponentInteraction): boolean {
        return client.data.custom_id === COMPONENT_IDS.MARK_AS_DONE;
    }
}
