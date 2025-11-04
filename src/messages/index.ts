import { Client } from 'eris';

import { IMessage } from '../interface';

export const MESSAGES: IMessage[] = [];

export const init = async (client: Client) => {
    await Promise.all(
        MESSAGES.map(async message => {
            await message.init(client);
        })
    );
};
