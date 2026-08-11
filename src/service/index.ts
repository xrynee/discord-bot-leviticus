import { Client } from 'eris';

import { IService } from '../interface';

// import { EmailWatcherService } from './email-watcher.service';
// import { SignalWatcherService } from './signal-watcher.service';
import { DbWatcherService } from './db-watcher.service';

const SERVICES: (client: Client) => IService[] = client => {
    return [
        // new EmailWatcherService(client),
        // POT_SPX / POT_NDX checks disabled
        // new SignalWatcherService(client),
        new DbWatcherService(client)
    ];
};

export const startServices = async (client: Client) => {
    await Promise.all(
        SERVICES(client).map(async service => {
            await service.start();
        })
    );
};
