import { COMMANDS } from '../commands';
import { ICommand, IMessage } from '../interface';
import { MESSAGES } from '../messages';

export class Global {
    static COMMANDS: ICommand[] = COMMANDS;
    static MESSAGES: IMessage[] = MESSAGES;

    static async refresh(guildId: string): Promise<void> {
        await Promise.all(MESSAGES.map(m => m.refresh(guildId)));
    }
}
