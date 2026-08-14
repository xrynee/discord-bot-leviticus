import { SECTOR_SYMBOLS, SWITCHBOARD_STRATEGIES } from '../config';
import {
    StrategyAllocation,
    StrategyPerformance,
    StrategyPeriod,
    StrategyReport,
    SwitchboardStrategy,
    Weights
} from '../interface';

import { CoreApiClient, HISTORY_PROVIDER, LIVE_PROVIDER } from './core-api.client';
import { DataSwitchboardClient } from './data-switchboard.client';
import { LocalStorage } from './local-storage';

// Weights come back with float noise (values like 2.4e-23) for sectors that were not picked.
const MIN_WEIGHT = 0.000001;

// A recommendation is only actionable once its 4pm ET close has been printed. The extra
// minutes give the daily bar time to settle before we treat it as an entry price.
const MARKET_CLOSE_HOUR = 16;
const CLOSE_SETTLE_MINUTES = 15;

const MAX_CONCURRENT_REQUESTS = 8;

// Extra lead-in on the bar request so the first entry date is always covered.
const BAR_LOOKBACK_PADDING_DAYS = 10;

// How far back to ask the live provider when topping up the history provider's missing tail.
const RECENT_FILL_DAYS = 10;

// Flat multiple used in place of the recommended leverage when running the naive comparison.
export const NAIVE_LEVERAGE = 2;

interface WeightsCache {
    [dt: string]: Weights | null;
}

interface PriceLookup {
    [symbol: string]: { [dt: string]: number };
}

interface QuoteLookup {
    [symbol: string]: number;
}

function addDays(dt: string, days: number): string {
    const date = new Date(`${dt}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
}

function isWeekend(dt: string): boolean {
    const day = new Date(`${dt}T12:00:00Z`).getUTCDay();
    return day === 0 || day === 6;
}

export class StrategyPerformanceCalculator {
    private swbClient: DataSwitchboardClient;
    private coreClient: CoreApiClient;

    constructor() {
        this.swbClient = new DataSwitchboardClient();
        this.coreClient = new CoreApiClient();
    }

    // With isNaive the sector weights and holding periods are untouched; only the recommended
    // leverage is swapped for NAIVE_LEVERAGE.
    public async calculate(lookbackDays: number, isNaive = false): Promise<StrategyReport> {
        const { date: asOfDate, hasSettled } = this.getMarketState();
        const fromDate = addDays(asOfDate, -lookbackDays);

        const dates: string[] = [];
        for (let dt = fromDate; dt <= asOfDate; dt = addDays(dt, 1)) {
            if (!isWeekend(dt)) dates.push(dt);
        }

        // Pull every strategy's recommendation history first so we know which ETFs to price.
        const histories: Weights[][] = [];
        for (const strategy of SWITCHBOARD_STRATEGIES) {
            histories.push(await this.getHistory(strategy, dates, asOfDate, hasSettled));
        }

        const symbols = this.getUsedSymbols(histories);
        const barsFrom = addDays(fromDate, -BAR_LOOKBACK_PADDING_DAYS);
        const prices = await this.getPrices(symbols, barsFrom, asOfDate, HISTORY_PROVIDER);
        await this.fillTodaysCloses(histories, prices, asOfDate);

        // The weights arms publish on some days the market is shut, and the price provider only
        // reaches back so far. Both leave recommendations we could never have acted on.
        const tradingDates = this.getTradingDates(prices);
        const priceHistoryStart = this.getPriceHistoryStart(tradingDates);

        const tradable: Weights[][] = [];
        const untradable: string[][] = [];
        for (const history of histories) {
            const traded: Weights[] = [];
            const missed: string[] = [];
            for (const weights of history) {
                if (tradingDates.has(weights.dt)) {
                    traded.push(weights);
                } else if (priceHistoryStart && weights.dt >= priceHistoryStart) {
                    // Inside the priced window but the market was shut — a genuinely missed day.
                    missed.push(weights.dt);
                }
            }
            tradable.push(traded);
            untradable.push(missed);
        }

        const quotes = await this.getQuotes(this.getOpenSymbols(tradable, prices));

        const strategies = SWITCHBOARD_STRATEGIES.map((strategy, index) =>
            this.buildPerformance(
                strategy,
                tradable[index],
                prices,
                quotes,
                untradable[index],
                isNaive
            )
        );

        return {
            isNaive,
            fromDate:
                priceHistoryStart && priceHistoryStart > fromDate ? priceHistoryStart : fromDate,
            requestedFromDate: fromDate,
            asOfDate,
            lookbackDays,
            priceHistoryStart,
            marketHasSettled: hasSettled,
            strategies
        };
    }

    // Every date the price provider printed a bar for — the days a position could actually move.
    private getTradingDates(prices: PriceLookup): Set<string> {
        const dates = new Set<string>();
        for (const symbol of Object.keys(prices)) {
            for (const dt of Object.keys(prices[symbol])) {
                dates.add(dt);
            }
        }
        return dates;
    }

    // The provider's bar history is finite, so a long lookback can start before any prices exist.
    private getPriceHistoryStart(tradingDates: Set<string>): string | null {
        let earliest: string | null = null;
        tradingDates.forEach(dt => {
            if (!earliest || dt < earliest) earliest = dt;
        });
        return earliest;
    }

    // Recommendation dates in ascending order, newest run per date, excluding today's
    // recommendation until its close has printed.
    private async getHistory(
        strategy: SwitchboardStrategy,
        dates: string[],
        asOfDate: string,
        hasSettled: boolean
    ): Promise<Weights[]> {
        const cache = (await LocalStorage.get<WeightsCache>(strategy.cacheKey)) || {};

        const missing = dates.filter(dt => !Object.prototype.hasOwnProperty.call(cache, dt));
        const fetched = await this.mapWithLimit(missing, dt =>
            this.swbClient.getWeightsByArm(dt, strategy.arm)
        );

        let cacheChanged = false;
        const resolved: WeightsCache = {};
        missing.forEach((dt, index) => {
            const rows = fetched[index];
            // Several runs can land on the same date; the newest id is the one the bot posts.
            const latest =
                Array.isArray(rows) && rows.length > 0
                    ? rows.reduce((a, b) => (b.id > a.id ? b : a))
                    : null;
            resolved[dt] = latest;

            // Past dates never change, so they are safe to remember. Today's is still moving.
            if (dt < asOfDate) {
                cache[dt] = latest;
                cacheChanged = true;
            }
        });

        if (cacheChanged) {
            await LocalStorage.set(strategy.cacheKey, cache);
        }

        const history: Weights[] = [];
        for (const dt of dates) {
            const weights = Object.prototype.hasOwnProperty.call(resolved, dt)
                ? resolved[dt]
                : cache[dt];
            if (!weights) continue;
            // Today's recommendation is bought at today's 4pm — it is not held before then.
            if (dt === asOfDate && !hasSettled) continue;
            history.push(weights);
        }

        return history;
    }

    private buildPerformance(
        strategy: SwitchboardStrategy,
        history: Weights[],
        prices: PriceLookup,
        quotes: QuoteLookup,
        untradableDates: string[],
        isNaive: boolean
    ): StrategyPerformance {
        const periods: StrategyPeriod[] = [];
        const skippedDates = untradableDates.slice();

        for (let i = 0; i < history.length; i++) {
            const entry = history[i];
            const exit = history[i + 1];
            const isOpen = !exit;
            const allocations = this.getAllocations(entry);

            let grossReturn = 0;
            let priced = allocations.length > 0;

            for (const allocation of allocations) {
                const entryPrice = prices[allocation.symbol]?.[entry.dt];
                const exitPrice = isOpen
                    ? quotes[allocation.symbol]
                    : prices[allocation.symbol]?.[exit.dt];

                if (!entryPrice || !exitPrice) {
                    priced = false;
                    break;
                }

                grossReturn += allocation.weight * (exitPrice / entryPrice - 1);
            }

            if (!priced) {
                skippedDates.push(entry.dt);
                continue;
            }

            const leverage = isNaive ? NAIVE_LEVERAGE : entry.leverage;

            periods.push({
                entryDate: entry.dt,
                exitDate: isOpen ? null : exit.dt,
                leverage,
                allocations,
                grossReturn,
                netReturn: grossReturn * leverage,
                isOpen
            });
        }

        let equity = 1;
        for (const period of periods) {
            equity *= 1 + period.netReturn;
        }

        const closed = periods.filter(period => !period.isOpen);

        return {
            version: strategy.version,
            periods,
            openPeriod: periods.filter(period => period.isOpen)[0] || null,
            totalReturn: equity - 1,
            closedCount: closed.length,
            wins: closed.filter(period => period.netReturn > 0).length,
            best: closed.reduce(this.pickBetter, null as StrategyPeriod | null),
            worst: closed.reduce(this.pickWorse, null as StrategyPeriod | null),
            skippedDates: skippedDates.sort()
        };
    }

    private pickBetter(current: StrategyPeriod | null, period: StrategyPeriod) {
        return !current || period.netReturn > current.netReturn ? period : current;
    }

    private pickWorse(current: StrategyPeriod | null, period: StrategyPeriod) {
        return !current || period.netReturn < current.netReturn ? period : current;
    }

    private getAllocations(weights: Weights): StrategyAllocation[] {
        const allocations: StrategyAllocation[] = [];
        for (const symbol of SECTOR_SYMBOLS) {
            const weight = (weights[`${symbol}_log` as keyof Weights] as number) || 0;
            if (weight > MIN_WEIGHT) {
                allocations.push({ symbol, weight });
            }
        }
        return allocations;
    }

    // Every symbol touched anywhere in the window — these need bar history.
    private getUsedSymbols(histories: Weights[][]): string[] {
        const symbols = new Set<string>();
        for (const history of histories) {
            for (const weights of history) {
                for (const allocation of this.getAllocations(weights)) {
                    symbols.add(allocation.symbol);
                }
            }
        }
        return Array.from(symbols);
    }

    // Only the currently held symbols need a live quote. Walk back past any recommendation we
    // could not price, since that is the one whose period gets dropped.
    private getOpenSymbols(histories: Weights[][], prices: PriceLookup): string[] {
        const symbols = new Set<string>();
        for (const history of histories) {
            for (let i = history.length - 1; i >= 0; i--) {
                const allocations = this.getAllocations(history[i]);
                const priced =
                    allocations.length > 0 &&
                    allocations.every(a => !!prices[a.symbol]?.[history[i].dt]);
                if (!priced) continue;

                for (const allocation of allocations) {
                    symbols.add(allocation.symbol);
                }
                break;
            }
        }
        return Array.from(symbols);
    }

    // The history provider stops at yesterday, so a recommendation made at today's close has no
    // entry price until the live provider is asked for it.
    private async fillTodaysCloses(
        histories: Weights[][],
        prices: PriceLookup,
        asOfDate: string
    ): Promise<void> {
        const lastPriced = this.getLatestPricedDate(prices);

        const symbols = new Set<string>();
        for (const history of histories) {
            for (const weights of history) {
                if (lastPriced && weights.dt <= lastPriced) continue;
                for (const allocation of this.getAllocations(weights)) {
                    symbols.add(allocation.symbol);
                }
            }
        }
        if (symbols.size === 0) return;

        const recent = await this.getPrices(
            Array.from(symbols),
            addDays(asOfDate, -RECENT_FILL_DAYS),
            asOfDate,
            LIVE_PROVIDER
        );

        for (const symbol of Object.keys(recent)) {
            if (!prices[symbol]) prices[symbol] = {};
            for (const dt of Object.keys(recent[symbol])) {
                // The history provider wins where it has data; this only fills its tail.
                if (!prices[symbol][dt]) prices[symbol][dt] = recent[symbol][dt];
            }
        }
    }

    private getLatestPricedDate(prices: PriceLookup): string | null {
        let latest: string | null = null;
        for (const symbol of Object.keys(prices)) {
            for (const dt of Object.keys(prices[symbol])) {
                if (!latest || dt > latest) latest = dt;
            }
        }
        return latest;
    }

    private async getPrices(
        symbols: string[],
        fromDate: string,
        toDate: string,
        provider: number
    ): Promise<PriceLookup> {
        const results = await this.mapWithLimit(symbols, symbol =>
            this.coreClient.getBars(symbol, fromDate, toDate, provider)
        );

        const prices: PriceLookup = {};
        symbols.forEach((symbol, index) => {
            const closes: { [dt: string]: number } = {};
            for (const bar of results[index] || []) {
                closes[bar.date.split('T')[0]] = bar.close;
            }
            prices[symbol] = closes;
        });
        return prices;
    }

    private async getQuotes(symbols: string[]): Promise<QuoteLookup> {
        const results = await this.mapWithLimit(symbols, symbol =>
            this.coreClient.getQuote(symbol)
        );

        const quotes: QuoteLookup = {};
        symbols.forEach((symbol, index) => {
            quotes[symbol] = results[index]?.last;
        });
        return quotes;
    }

    // A long lookback is a lot of single-date weight lookups, so keep them in flight together
    // without opening one connection per date.
    private async mapWithLimit<TItem, TResult>(
        items: TItem[],
        handler: (item: TItem) => Promise<TResult>
    ): Promise<TResult[]> {
        const results: TResult[] = new Array(items.length);
        let next = 0;

        const worker = async () => {
            while (next < items.length) {
                const index = next++;
                results[index] = await handler(items[index]);
            }
        };

        const workers = [];
        for (let i = 0; i < Math.min(MAX_CONCURRENT_REQUESTS, items.length); i++) {
            workers.push(worker());
        }
        await Promise.all(workers);

        return results;
    }

    private getMarketState(): { date: string; hasSettled: boolean } {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).formatToParts(new Date());

        const get = (type: string) => parts.filter(part => part.type === type)[0]?.value || '0';
        // Some runtimes report midnight as hour 24.
        const hours = parseInt(get('hour'), 10) % 24;
        const minutes = parseInt(get('minute'), 10);

        return {
            date: `${get('year')}-${get('month')}-${get('day')}`,
            hasSettled:
                hours > MARKET_CLOSE_HOUR ||
                (hours === MARKET_CLOSE_HOUR && minutes >= CLOSE_SETTLE_MINUTES)
        };
    }
}
