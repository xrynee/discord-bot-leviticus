import * as eris from 'eris';

import { ICommand } from '../interface';

// import { CbaAccept } from './cba-accept';
import { CfbAssign } from './cfb-assign';
import { CfbInit } from './cfb-init';

export const COMMANDS: ICommand[] = [
    // new CbaAccept(),
    new CfbAssign(),
    new CfbInit()
];

export const ensureCommands = async (client: eris.Client): Promise<ICommand[]> => {
    // await client.deleteCommand('1265762454630039586');
    // await client.deleteCommand('1265762456672669879');
    // await client.deleteCommand('1265762458421956608');
    await Promise.all(
        COMMANDS.map(async command => {
            await command.create(client);
        })
    );
    const commands = await client.getCommands();
    // console.log('commands', commands);
    return COMMANDS;
};
