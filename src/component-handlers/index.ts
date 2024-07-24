import { IComponentHandler } from '../interface';

import { CfbCancelClearGameCache } from './cfb-cancel-clear-game-cache';
import { CfbClearGameCache } from './cfb-clear-game-cache';
import { CfbGameDone } from './cfb-game-done';
import { CfbGameNotDone } from './cfb-game-not-done';
import { CfbSelectSchool } from './cfb-select-school';

export const COMPONENT_HANDLERS: IComponentHandler[] = [
    new CfbSelectSchool(),
    new CfbGameDone(),
    new CfbGameNotDone(),
    new CfbClearGameCache(),
    new CfbCancelClearGameCache()
];
