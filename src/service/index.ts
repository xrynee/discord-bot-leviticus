import { Client } from 'eris';

import { IService } from '../interface';

// import { EmailWatcherService } from './email-watcher.service';
import { DbWatcherService } from './db-watcher.service';
import { SignalWatcherService } from './signal-watcher.service';

const SERVICES: (client: Client) => IService[] = client => {
    return [
        // new EmailWatcherService(client),
        new DbWatcherService(client),
        new SignalWatcherService(client)
    ];
};

export const startServices = async (client: Client) => {
    await Promise.all(
        SERVICES(client).map(async service => {
            await service.start();
        })
    );
};
