import { Client } from 'eris';

import { IService } from '../interface';

import { EmailWatcherService } from './email-watcher.service';

const SERVICES: (client: Client) => IService[] = client => {
    return [new EmailWatcherService(client)];
};

export const startServices = async (client: Client) => {
    await Promise.all(
        SERVICES(client).map(async service => {
            await service.start();
        })
    );
};
