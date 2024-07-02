import { Client } from 'eris';

export interface IMessage {
    init(client: Client): Promise<void>;
    refresh(guildId: string): Promise<void>;
}
