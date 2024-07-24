import * as eris from 'eris';

import { ICommand } from '../interface';

import { CbaAccept } from './cba-accept';
import { LeviRegisterPlayer } from './levi-register-player';

export const COMMANDS: ICommand[] = [
    // new AddRomRoleCommand(),
    // new RegisterRomRoleCommand(),
    // new SetChannelCommand(),
    new CbaAccept(),
    new LeviRegisterPlayer()
];

export const onEvent = async (event: eris.Interaction) => {
    if (event instanceof eris.CommandInteraction || event instanceof eris.ComponentInteraction) {
        const command = COMMANDS.find(c => c.isHandledBy(event));

        command?.handle(event);
    }
};

export const ensureCommands = async (client: eris.Client): Promise<ICommand[]> => {
    await Promise.all(
        COMMANDS.map(async command => {
            await command.create(client);
        })
    );
    // const commands = await client.getCommands();
    // console.log('commands', commands);
    return COMMANDS;
};
