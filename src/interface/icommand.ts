import eris, { ApplicationCommandStructure, Client, Interaction } from 'eris';

export interface ICommand {
    getDefinition(): ApplicationCommandStructure;
    create(client: Client, cmd: eris.ApplicationCommand): void;
    handle(event: Interaction): Promise<any>;
    isHandledBy(event: eris.CommandInteraction): boolean;
}
