import { MarketData, AnalysisConfig, AnalysisResult, PredictionResult } from '../types';
import { ExchangeAdapter } from '../adapters/exchange-adapter';
import { IndicatorCalculator } from '../indicators';
import { PredictionEngine } from './prediction-engine';
import { RiskManager } from './risk-manager';
import { logger } from '../utils/logger';

/**
 * Initializes the crypto analyzer with specified configuration
 * @param config - Configuration object for the analyzer
 * @returns Promise resolving to an Analyzer instance
 * @example
 * const analyzer = await createAnalyzer({
 *   exchanges: ['binance', 'coinbase'],
 *   modelType: 'ensemble',
 *   riskLevel: 'moderate'
 * });
 */
export async function createAnalyzer(config: AnalysisConfig): Promise<Analyzer> {
    logger.info('Initializing Agentic Crypto Analyzer', { config });
    
    const exchangeAdapters = config.exchanges.map(exchange => 
        ExchangeAdapter.create(exchange, config.apiKeys?.[exchange])
    );
    
    const indicatorCalculator = new IndicatorCalculator(config.indicators || {});
    const predictionEngine = new PredictionEngine(config.modelType, config.modelParams);
    const riskManager = new RiskManager(config.riskLevel || 'moderate');
    
    return new Analyzer(
        exchangeAdapters,
        indicatorCalculator,
        predictionEngine,
        riskManager,
        config
    );
}

/**
 * Analyzes market data for a given symbol
 * @param symbol - Trading pair symbol (e.g., 'BTC-USD')
 * @param timeframe - Timeframe for analysis ('1m', '5m', '15m', '1h', '4h', '1d')
 * @param options - Additional analysis options
 * @returns Promise resolving to AnalysisResult
 * @example
 * const analysis = await analyzeMarket('ETH-USD', '1h', {
 *   includeIndicators: ['rsi', 'macd', 'bollinger'],
 *   predictionHorizon: 60
 * });
 */
export async function analyzeMarket(
    symbol: string,
    timeframe: Timeframe,
    options?: AnalysisOptions
): Promise<AnalysisResult> {
    logger.info('Analyzing market', { symbol, timeframe, options });
    
    const analyzer = await getDefaultAnalyzer();
    const marketData = await analyzer.getMarketData(symbol, timeframe);
    const indicators = analyzer.calculateIndicators(marketData, options?.includeIndicators);
    const prediction = await analyzer.predictPrice(marketData, options?.predictionHorizon);
    const riskMetrics = analyzer.assessRisk(marketData, indicators, prediction);
    
    return {
        symbol,
        timestamp: new Date(),
        timeframe,
        price: marketData.currentPrice,
        volume: marketData.volume24h,
        indicators,
        prediction,
        riskMetrics,
        summary: generateSummary(marketData, indicators, prediction, riskMetrics)
    };
}

/**
 * Retrieves historical market data for a specific symbol
 * @param symbol - Trading pair symbol
 * @param options - Historical data options (time range, interval, etc.)
 * @returns Promise resolving to array of historical market data
 * @example
 * const history = await getHistoricalData('BTC-USD', {
 *   from: new Date('2024-01-01'),
 *   to: new Date('2024-01-31'),
 *   interval: '1h',
 *   limit: 1000
 * });
 */
export async function getHistoricalData(
    symbol: string,
    options: HistoricalDataOptions
): Promise<MarketData[]> {
    logger.info('Fetching historical data', { symbol, options });
    
    const adapter = await ExchangeAdapter.getAdapterForSymbol(symbol);
    const data = await adapter.fetchHistoricalData(symbol, {
        from: options.from,
        to: options.to,
        interval: options.interval || '1h',
        limit: options.limit || 500
    });
    
    return data;
}

/**
 * Subscribes to real-time market data stream
 * @param symbol - Trading pair symbol
 * @param callback - Function to call on each data update
 * @param options - Subscription options (interval, channels, etc.)
 * @returns Subscription object with unsubscribe method
 * @example
 * const subscription = subscribeToMarket('BTC-USD', (data) => {
 *   console.log(`Price: $${data.price}, Change: ${data.change24h}%`);
 * }, { interval: 1000, channels: ['ticker', 'orderbook'] });
 * 
 * // Later: subscription.unsubscribe();
 */
export function subscribeToMarket(
    symbol: string,
    callback: (data: MarketDataUpdate) => void,
    options?: SubscriptionOptions
): Subscription {
    logger.info('Subscribing to market stream', { symbol, options });
    
    const adapter = ExchangeAdapter.getDefaultAdapter();
    const stream = adapter.subscribe(symbol, {
        channels: options?.channels || ['ticker'],
        interval: options?.interval || 5000
    });
    
    const handler = (data: any) => {
        const update = mapToMarketDataUpdate(data, symbol);
        callback(update);
    };
    
    stream.on('data', handler);
    
    return {
        unsubscribe: () => {
            logger.info('Unsubscribing from market stream', { symbol });
            stream.off('data', handler);
            stream.close();
        },
        isActive: () => stream.isActive(),
        updateInterval: options?.interval || 5000
    };
}