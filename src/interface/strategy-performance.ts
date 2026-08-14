// One arm of the switchboard weights signal.
export interface SwitchboardStrategy {
    version: string;
    // Omitted for the default arm; otherwise passed through as `&arm=`.
    arm?: string;
    // LocalStorage key the fetched weights history is cached under.
    cacheKey: string;
}

export interface StrategyAllocation {
    symbol: string;
    weight: number;
}

// A single round trip: bought at the entry date's 4pm close, sold at the exit date's
// 4pm close. While `isOpen` the position is still held and marked to the live quote.
export interface StrategyPeriod {
    entryDate: string;
    exitDate: string | null;
    leverage: number;
    allocations: StrategyAllocation[];
    // Portfolio return before leverage is applied.
    grossReturn: number;
    // grossReturn * leverage — what the recommendation actually returned.
    netReturn: number;
    isOpen: boolean;
}

export interface StrategyPerformance {
    version: string;
    periods: StrategyPeriod[];
    openPeriod: StrategyPeriod | null;
    // Compounded across every period, including the open one marked to market.
    totalReturn: number;
    closedCount: number;
    wins: number;
    best: StrategyPeriod | null;
    worst: StrategyPeriod | null;
    // Recommendation dates that could not be traded — market holidays, or a missing close.
    // The position simply carries through them.
    skippedDates: string[];
}

export interface StrategyReport {
    // True when the recommended leverage was replaced by a flat multiple, keeping the same
    // sector weights and holding periods — isolates what the leverage signal is worth.
    isNaive: boolean;
    // Window actually covered, which may start later than asked for if price history is short.
    fromDate: string;
    requestedFromDate: string;
    asOfDate: string;
    lookbackDays: number;
    // Earliest date the price provider has bars for, or null if it returned nothing.
    priceHistoryStart: string | null;
    // False before the 4pm close has settled, meaning today's recommendation is not yet held.
    marketHasSettled: boolean;
    strategies: StrategyPerformance[];
}
