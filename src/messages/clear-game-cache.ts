import { Channel, Client, Constants } from 'eris';

import { COMPONENT_IDS, DIVIDER, FILES } from '../config';
import { IMessage } from '../interface';
import { LocalStorage } from '../util';

export interface LvGame {
    userId: string;
    isDone?: boolean;
}

export class ClearGameCache implements IMessage {
    private client: Client;

    private channel: Channel;

    private async getChannelId(): Promise<string> {
        const channelId = await LocalStorage.get(FILES.CHANNEL_ID);
        if ((!!channelId && !this.channel) || (!!this.channel && this.channel.id !== channelId)) {
            this.channel = await this.client.getChannel(channelId as string);
        }
        return channelId as string;
    }

    private async getMessageId(channelId: string): Promise<string> {
        let messageId = await LocalStorage.get<string>(FILES.CLEAR_MESSAGE_ID);
        if (!messageId) {
            const newMessage = await this.client.createMessage(channelId, '_');
            messageId = newMessage.id;
            await LocalStorage.set(FILES.CLEAR_MESSAGE_ID, messageId);
        }
        return messageId;
    }

    public async init(client: Client): Promise<void> {
        this.client = client;

        // await this.refresh(this.client.guilds.values().next().value?.id);
        await this.refresh();
    }

    public async refresh(): Promise<void> {
        const channelId = await this.getChannelId();
        if (!channelId) {
            return;
        }

        const messageId = await this.getMessageId(channelId);

        const isOnStep2 = (await LocalStorage.get(FILES.CLEAR_STEP_2)) === 'true';

        const components = [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        label: isOnStep2 ? 'YES, CLEAR' : 'CLEAR',
                        custom_id: COMPONENT_IDS.CLEAR_GAME_CACHE,
                        style: Constants.ButtonStyles.PRIMARY
                    }
                ]
            }
        ];

        if (isOnStep2) {
            components.push({
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        label: 'NEVERMIND',
                        custom_id: COMPONENT_IDS.CANCEL_CLEAR_GAME_CACHE,
                        style: Constants.ButtonStyles.PRIMARY
                    }
                ]
            });
        }

        const content: string = isOnStep2
            ? 'Are you sure you want to clear the game cache?'
            : DIVIDER;

        await this.client.editMessage(channelId, messageId, {
            content,
            components
        });
    }
}
