// A daily OHLC bar from core-api's /bars/D/:symbol route.
export interface Bar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    symbol: string;
    timestamp: string | null;
}

// A live quote from core-api's /quotes/:symbol route.
export interface Quote {
    date: string;
    symbol: string;
    underlyingSymbol: string | null;
    bid: number;
    ask: number;
    mid: number;
    last: number;
    previousOpen: number;
    previousClose: number;
    timestamp: string;
    isDelayed: boolean;
}
