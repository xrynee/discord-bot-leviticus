import { MESSAGES } from '../messages';

// Deliberately does not import the command registry: `commands` imports this barrel back, and
// the cycle leaves whichever side loads second holding undefined exports.
export class Global {
    static async refresh(guildId: string): Promise<void> {
        await Promise.all(MESSAGES.map(m => m.refresh(guildId)));
    }
}
