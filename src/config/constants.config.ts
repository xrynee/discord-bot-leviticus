import { SwitchboardStrategy } from '../interface';

export const DIVIDER = '---------------------------------';

export const COMMANDS = {
    LEVI_INIT: 'levi-init',
    SIGNAL_CONFIG: 'signal-config',
    SIGNAL_HELP: 'signal-help',
    STRATEGY_PERFORMANCE: 'strategy-performance'
};

export const FILES = {
    CHANNEL: 'channel',
    LAST_WEIGHT_ID: 'last-weight-id',
    LAST_WEIGHT_ID_V2: 'last-weight-id-v2',
    LAST_SIGNAL_DATE_SPX: 'last-signal-date-spx',
    LAST_SIGNAL_DATE_NDX: 'last-signal-date-ndx',
    SIGNAL_CONFIG: 'signal-config',
    LAST_SIGNAL_MESSAGE: 'last-signal-message'
};

// The sector ETFs the switchboard allocates across, in the order the weights are reported.
export const SECTOR_SYMBOLS = [
    'XLC',
    'XLY',
    'XLP',
    'XLE',
    'XLF',
    'XLV',
    'XLI',
    'XLB',
    'XLRE',
    'XLK',
    'XLU'
];

// The strategy arms the bot tracks. These are the same two the weights watcher posts each day.
export const SWITCHBOARD_STRATEGIES: SwitchboardStrategy[] = [
    { version: 'V1', cacheKey: 'weights-history-v1' },
    { version: 'V2', arm: 'nearclose', cacheKey: 'weights-history-v2' }
];

export const COMPONENT_IDS = {
    SIGNAL_CALCULATE: 'signal-calculate',
    SIGNAL_MODAL: 'signal-modal'
};
