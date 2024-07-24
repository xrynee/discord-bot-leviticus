import { Client } from 'eris';

import { IMessage } from '../interface';

import { ClearGameCache } from './clear-game-cache';
import { CurrentSchedule } from './current-schedule';

export const MESSAGES: IMessage[] = [new ClearGameCache(), new CurrentSchedule()];

export const init = async (client: Client) => {
    await Promise.all(
        MESSAGES.map(async message => {
            await message.init(client);
        })
    );
};
