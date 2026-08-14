import {
    ApplicationCommand,
    ApplicationCommandOptionsBoolean,
    ApplicationCommandStructure,
    Client,
    CommandInteraction,
    Constants
} from 'eris';

import { COMMANDS, DIVIDER } from '../config';
import {
    ICommand,
    StrategyPerformance as Performance,
    StrategyPeriod,
    StrategyReport
} from '../interface';
import { NAIVE_LEVERAGE, StrategyPerformanceCalculator } from '../util';

const DEFAULT_LOOKBACK_DAYS = 30;
const MIN_LOOKBACK_DAYS = 5;
// Weights history starts in 2021, so anything past ~5.5 years just adds empty lookups.
const MAX_LOOKBACK_DAYS = 2000;

// Discord rejects anything longer.
const MAX_MESSAGE_LENGTH = 2000;

const MAX_SKIPPED_DATES_SHOWN = 3;

const EPHEMERAL_FLAG = 64;

const percent = (value: number) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;
const monthDay = (dt: string) => dt.substring(5);
const year = (dt: string) => dt.substring(0, 4);

// Month/day alone is ambiguous once the window spans more than one year.
type DateFormatter = (dt: string) => string;

export class StrategyPerformance implements ICommand {
    private cmd: ApplicationCommand;
    private calculator: StrategyPerformanceCalculator;

    constructor() {
        this.calculator = new StrategyPerformanceCalculator();
    }

    public getDefinition(): ApplicationCommandStructure {
        return {
            name: COMMANDS.STRATEGY_PERFORMANCE,
            description:
                'How each switchboard strategy has done buying its 4pm recommendation and holding to the next.',
            options: [
                {
                    name: 'days',
                    description: `Calendar days to look back (default: ${DEFAULT_LOOKBACK_DAYS})`,
                    type: Constants.ApplicationCommandOptionTypes.INTEGER,
                    required: false
                },
                // Eris 0.17 types `channel_types` as required-but-never on boolean options,
                // so these literals cannot satisfy it without the assertion.
                {
                    name: 'is_naive',
                    description: `Use a flat ${NAIVE_LEVERAGE}x every day instead of the recommended leverage`,
                    type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: false
                } as ApplicationCommandOptionsBoolean,
                {
                    name: 'share',
                    description: 'Post the results to the channel instead of only to you',
                    type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                    required: false
                } as ApplicationCommandOptionsBoolean
            ],
            type: Constants.ApplicationCommandTypes.CHAT_INPUT
        };
    }

    public create(_client: Client, cmd: ApplicationCommand) {
        this.cmd = cmd;
    }

    public async handle(interaction: CommandInteraction): Promise<void> {
        const options = (interaction.data.options || []) as any[];
        const getOption = (name: string) =>
            options.filter(option => option.name === name)[0]?.value;

        const requestedDays = Number(getOption('days')) || DEFAULT_LOOKBACK_DAYS;
        const days = Math.min(MAX_LOOKBACK_DAYS, Math.max(MIN_LOOKBACK_DAYS, requestedDays));
        const isNaive = getOption('is_naive') === true;
        const flags = getOption('share') === true ? 0 : EPHEMERAL_FLAG;

        // Building the report takes a few seconds of API calls, well past the 3s ack window.
        await interaction.defer(flags);

        try {
            const report = await this.calculator.calculate(days, isNaive);
            await interaction.createFollowup({ content: this.buildMessage(report), flags });
        } catch (error) {
            console.error('Error building strategy performance report:', error);
            await interaction.createFollowup({
                content: 'Could not build the strategy performance report. Check the logs.',
                flags
            });
        }
    }

    private buildMessage(report: StrategyReport): string {
        const timestamp = Math.floor(Date.now() / 1000);

        const lines: string[] = [
            `**Switchboard Strategy Performance**${
                report.isNaive ? ` (naive ${NAIVE_LEVERAGE}x)` : ''
            }`,
            report.isNaive
                ? `Same picks and holding periods, but a flat ${NAIVE_LEVERAGE}x instead of the recommended leverage.`
                : 'Buy each recommendation at the 4pm close, hold until the next 4pm that has one.',
            `${report.fromDate} → ${report.asOfDate} (${report.lookbackDays}d) — as of <t:${timestamp}:f>`,
            ''
        ];

        const formatDate: DateFormatter =
            year(report.fromDate) === year(report.asOfDate) ? monthDay : dt => dt;

        for (const strategy of report.strategies) {
            lines.push(...this.buildStrategySection(strategy, formatDate), '');
        }

        if (report.priceHistoryStart && report.priceHistoryStart > report.requestedFromDate) {
            lines.push(
                `_Prices only go back to ${report.priceHistoryStart}, so the window starts there._`
            );
        }

        if (!report.marketHasSettled) {
            lines.push(`_Today's recommendation is not counted until the 4pm close prints._`);
        }

        lines.push(DIVIDER);

        const message = lines.join('\n');
        return message.length > MAX_MESSAGE_LENGTH
            ? `${message.substring(0, MAX_MESSAGE_LENGTH - 3)}...`
            : message;
    }

    private buildStrategySection(strategy: Performance, formatDate: DateFormatter): string[] {
        const lines = [`**${strategy.version}**`];

        if (strategy.periods.length === 0) {
            lines.push('No recommendations in this window.');
            return lines;
        }

        const winRate =
            strategy.closedCount > 0 ? Math.round((strategy.wins / strategy.closedCount) * 100) : 0;

        lines.push(`Total: **${percent(strategy.totalReturn)}**`);
        lines.push(`Win: ${strategy.wins}/${strategy.closedCount} (${winRate}%)`);

        if (strategy.best && strategy.worst) {
            lines.push(
                `Best: ${percent(strategy.best.netReturn)} ` +
                    `(${formatDate(strategy.best.entryDate)}) · ` +
                    `Worst: ${percent(strategy.worst.netReturn)} ` +
                    `(${formatDate(strategy.worst.entryDate)})`
            );
        }

        if (strategy.openPeriod) {
            const open = strategy.openPeriod;
            lines.push(
                `Holding: ${this.describeAllocations(open)} · **${percent(open.netReturn)}**`
            );
        }

        if (strategy.skippedDates.length > 0) {
            const shown = strategy.skippedDates
                .slice(0, MAX_SKIPPED_DATES_SHOWN)
                .map(dt => formatDate(dt));
            const extra = strategy.skippedDates.length - shown.length;
            lines.push(
                `_Held through ${shown.join(', ')}${extra > 0 ? ` +${extra} more` : ''} — ` +
                    'recommended on a day the market was shut._'
            );
        }

        return lines;
    }

    private describeAllocations(period: StrategyPeriod): string {
        const allocations = period.allocations
            // Sub-1% slices are rounding noise, not a real position.
            .filter(allocation => Math.round(allocation.weight * 100) > 0)
            .map(allocation => `${allocation.symbol} ${Math.round(allocation.weight * 100)}%`);
        return `${allocations.join(' / ')} @ ${period.leverage.toFixed(2)}x`;
    }

    public isHandledBy(event: CommandInteraction): boolean {
        return event.data.name === this.cmd.name;
    }
}
