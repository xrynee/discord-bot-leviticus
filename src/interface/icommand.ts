import eris, { Client, Interaction } from 'eris';

export interface ICommand {
    create(client: Client): Promise<any>;
    handle(event: Interaction): Promise<any>;
    isHandledBy(event: eris.CommandInteraction): boolean;
}
