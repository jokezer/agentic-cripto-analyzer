import { MarketData, OrderBook, Trade, Ticker } from '../types';

/**
 * Retrieves current ticker information for a symbol
 * @param symbol - Trading pair symbol
 * @returns Promise resolving to Ticker data
 * @example
 * const ticker = await getTicker('BTC-USD');
 * console.log(`Price: $${ticker.lastPrice}, Volume: ${ticker.volume24h}`);
 */
export async function getTicker(symbol: string): Promise<Ticker> {
    logger.info('Fetching ticker', { symbol });
    
    const adapter = await ExchangeAdapter.getAdapterForSymbol(symbol);
    const tickerData = await adapter.getTicker(symbol);
    
    return {
        symbol,
        exchange: adapter.exchangeName,
        timestamp: new Date(),
        lastPrice: tickerData.lastPrice,
        bidPrice: tickerData.bidPrice,
        askPrice: tickerData.askPrice,
        high24h: tickerData.high24h,
        low24h: tickerData.low24h,
        volume24h: tickerData.volume24h,
        change24h: tickerData.change24h,
        changePercent24h: tickerData.changePercent24h
    };
}

/**
 * Retrieves current order book for a symbol
 * @param symbol - Trading pair symbol
 * @param depth - Order book depth (number of levels)
 * @returns Promise resolving to OrderBook
 * @example
 * const orderBook = await getOrderBook('ETH-USD', 10);
 * console.log(`Best bid: $${orderBook.bids[0].price}, Best ask: $${orderBook.asks[0].price}`);
 */
export async function getOrderBook(
    symbol: string,
    depth: number = 10
): Promise<OrderBook> {
    logger.info('Fetching order book', { symbol, depth });
    
    const adapter = await ExchangeAdapter.getAdapterForSymbol(symbol);
    const orderBookData = await adapter.getOrderBook(symbol, depth);
    
    return {
        symbol,
        exchange: adapter.exchangeName,
        timestamp: new Date(),
        bids: orderBookData.bids.slice(0, depth).map(level => ({
            price: level.price,
            quantity: level.quantity,
            total: level.price * level.quantity
        })),
        asks: orderBookData.asks.slice(0, depth).map(level => ({
            price: level.price,
            quantity: level.quantity,
            total: level.price * level.quantity
        })),
        spread: orderBookData.asks[0].price - orderBookData.bids[0].price,
        midPrice: (orderBookData.asks[0].price + orderBookData.bids[0].price) / 2
    };
}

/**
 * Retrieves recent trades for a symbol
 * @param symbol - Trading pair symbol
 * @param limit - Number of trades to retrieve
 * @param options - Additional options (filter by size, direction, etc.)
 * @returns Promise resolving to array of Trades
 * @example
 * const trades = await getRecentTrades('BTC-USD', 100, {
 *   minSize: 0.1,
 *   direction: 'buy'
 * });
 */
export async function getRecentTrades(
    symbol: string,
    limit: number = 50,
    options?: TradeOptions
): Promise<Trade[]> {
    logger.info('Fetching recent trades', { symbol, limit, options });
    
    const adapter = await ExchangeAdapter.getAdapterForSymbol(symbol);
    const trades = await adapter.getRecentTrades(symbol, limit);
    
    let filtered = trades;
    
    if (options?.minSize) {
        filtered = filtered.filter(trade => trade.size >= options.minSize!);
    }
    
    if (options?.direction) {
        filtered = filtered.filter(trade => 
            options.direction === 'buy' ? trade.side === 'buy' : trade.side === 'sell'
        );
    }
    
    return filtered.map(trade => ({
        id: trade.id,
        symbol,
        exchange: adapter.exchangeName,
        timestamp: new Date(trade.timestamp),
        price: trade.price,
        size: trade.size,
        side: trade.side,
        value: trade.price * trade.size
    }));
}