export interface GroupConfig {
    messageId: string;
    childMessageId: string;
    description: string;
    role: {
        name: string;
        id: string;
    };
    channel: {
        name: string;
        id: string;
    };
}
