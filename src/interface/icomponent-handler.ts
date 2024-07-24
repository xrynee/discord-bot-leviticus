import eris, { Interaction } from 'eris';

export interface IComponentHandler {
    handle(event: Interaction): Promise<any>;
    isHandledBy(event: eris.ComponentInteraction): boolean;
}
