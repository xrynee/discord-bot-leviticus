import { ActionRow, Channel, Client, Constants } from 'eris';

import { COMMANDS, COMPONENT_IDS, DIVIDER, FILES, SCHOOLS } from '../config';
import { IMessage, SchoolAssignment } from '../interface';
import { LocalStorage } from '../util';

export interface LvGame {
    userId: string;
    isDone?: boolean;
}

export class CurrentSchedule implements IMessage {
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
        let messageId = await LocalStorage.get<string>(FILES.CURRENT_GAMES_MESSAGE_ID);
        if (!messageId) {
            const newMessage = await this.client.createMessage(channelId, '_');
            messageId = newMessage.id;
            await LocalStorage.set(FILES.CURRENT_GAMES_MESSAGE_ID, messageId);
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

        const assignments: SchoolAssignment[] = await LocalStorage.get(FILES.ASSIGNMENTS);
        const messageId = await this.getMessageId(channelId);
        if (!assignments?.length) {
            await this.client.editMessage(channelId, messageId, {
                content: `No users are assigned to schools. Use \`${COMMANDS.ASSIGN}\` to assign users to schools.`
            });
        } else {
            assignments.sort((a, b) => a.schoolId - b.schoolId);
            const gameCache: LvGame[] = await LocalStorage.get(FILES.GAME_CACHE);

            let messageContent = DIVIDER + '\n\n';
            assignments?.forEach(assignment => {
                const user = this.client.users.get(assignment.userId);
                if (!user) {
                    return;
                }
                const school = SCHOOLS.find(s => s.id === assignment.schoolId);
                const game = gameCache?.find(g => g.userId === assignment.userId);

                messageContent += `<@${user.id}> - ${school.name} - ${
                    game?.isDone ? '✅' : '❌'
                }\n\n`;
            });
            messageContent += DIVIDER;

            try {
                await this.client.editMessage(channelId, messageId, {
                    content: messageContent,
                    components: this.buildComponents(assignments)
                });
            } catch (e) {
                await LocalStorage.set(FILES.CURRENT_GAMES_MESSAGE_ID, '');
                this.refresh();
            }
        }
    }

    private buildComponents(assignments: SchoolAssignment[]): ActionRow[] {
        const mapBySchool = assignments.reduce((acc, a) => {
            acc[a.schoolId] = true;
            return acc;
        }, {} as any);
        return [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.SELECT_MENU,
                        custom_id: COMPONENT_IDS.SELECT_SCHOOL,
                        placeholder: 'Manually update school status',
                        options: SCHOOLS.filter(s => !!mapBySchool[s.id]).map(s => ({
                            label: s.name,
                            value: `${s.id}`
                        }))
                    }
                ]
            },
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        emoji: {
                            name: '✔️'
                        },
                        custom_id: COMPONENT_IDS.MARK_AS_DONE,
                        style: Constants.ButtonStyles.SUCCESS
                    },
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        emoji: {
                            name: '❌'
                        },
                        custom_id: COMPONENT_IDS.MARK_AS_NOT_DONE,
                        style: Constants.ButtonStyles.SECONDARY
                    }
                ]
            }
        ];
    }
}
