import * as eris from 'eris';

import { ICommand } from '../interface';

// import { CbaAccept } from './cba-accept';
// import { CfbAssign } from './cfb-assign';
// import { CfbInit } from './cfb-init';
// import { TwitchCommand } from './twitch';
import { LeviInit } from './levi-init';
import { SignalConfig } from './signal-config';
import { SignalHelp } from './signal-help';
import { StrategyPerformance } from './strategy-performance';

export const COMMANDS: ICommand[] = [
    // new CbaAccept(),
    // new CfbAssign(),
    // new CfbInit(),
    // new TwitchCommand()
    new LeviInit(),
    new SignalConfig(),
    new SignalHelp(),
    new StrategyPerformance()
];

export const ensureCommands = async (client: eris.Client): Promise<ICommand[]> => {
    const definitions = COMMANDS.map(command => command.getDefinition());

    // Names are logged so a stale deploy is obvious: this is the exact set that will replace
    // whatever Discord currently has, since bulkEditCommands overwrites rather than merges.
    console.log(
        `Registering ${definitions.length} commands: ${definitions.map(d => d.name).join(', ')}`
    );

    const registered = await client.bulkEditCommands(definitions);

    // Map registered commands back to handlers by name
    for (const cmd of registered) {
        const handler = COMMANDS.find(c => c.getDefinition().name === cmd.name);
        if (handler) {
            handler.create(client, cmd);
        }
    }

    console.log(`Registered ${registered.length} commands via bulkEditCommands`);
    return COMMANDS;
};
