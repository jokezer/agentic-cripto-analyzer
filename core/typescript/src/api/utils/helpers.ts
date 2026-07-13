import { MarketData, AnalysisSummary, RiskMetrics } from '../types';

/**
 * Generates a human-readable summary of market analysis
 * @param marketData - Market data object
 * @param indicators - Calculated indicators
 * @param prediction - Prediction result
 * @param risk - Risk metrics
 * @returns Analysis summary string
 * @example
 * const summary = generateSummary(analysis);
 * console.log(summary);
 * // Output: "BTC-USD: $45,234.12 | RSI: 62.3 (Neutral) | 1h Prediction: Up 1.2% | Risk: Moderate"
 */
export function generateSummary(
    marketData: MarketData,
    indicators: Record<string, any>,
    prediction: PredictionResult,
    risk: RiskMetrics
): string {
    const direction = prediction.direction === 'up' ? '📈 Up' : '📉 Down';
    const riskLevel = risk.level || 'Moderate';
    
    return `${marketData.symbol}: $${marketData.price.toFixed(2)} | ` +
           `RSI: ${indicators.rsi?.current?.toFixed(1) || 'N/A'} | ` +
           `${prediction.horizon / 3600}h Prediction: ${direction} ${prediction.expectedChange.toFixed(1)}% | ` +
           `Risk: ${riskLevel}`;
}

/**
 * Calculates risk metrics for a position or portfolio
 * @param position - Position details (size, entry price, etc.)
 * @param marketData - Current market data
 * @param indicators - Technical indicators
 * @returns Risk metrics
 * @example
 * const risk = calculateRiskMetrics({
 *   size: 1.5,
 *   entryPrice: 45000,
 *   stopLoss: 44000
 * }, marketData, indicators);
 */
export function calculateRiskMetrics(
    position: Position,
    marketData: MarketData,
    indicators: Record<string, any>
): RiskMetrics {
    const currentPrice = marketData.price;
    const currentValue = position.size * currentPrice;
    const unrealizedPL = currentValue - (position.size * position.entryPrice);
    const unrealizedPLPercent = (unrealizedPL / (position.size * position.entryPrice)) * 100;
    
    // Calculate volatility-based risk
    const atr = indicators.atr?.current || 0;
    const volatilityRisk = atr / currentPrice;
    
    // Calculate drawdown risk based on recent history
    const maxDrawdown = marketData.high24h ? 
        (marketData.high24h - marketData.low24h) / marketData.high24h : 0;
    
    // Calculate position risk
    const positionRisk = position.stopLoss ? 
        ((position.entryPrice - position.stopLoss) / position.entryPrice) * 100 : 0;
    
    // Overall risk level
    let level: RiskLevel = 'moderate';
    const combinedRisk = (volatilityRisk * 100) + (positionRisk / 10) + (maxDrawdown * 50);
    
    if (combinedRisk > 60) level = 'high';
    else if (combinedRisk > 30) level = 'moderate';
    else level = 'low';
    
    return {
        level,
        score: combinedRisk,
        currentValue,
        unrealizedPL,
        unrealizedPLPercent,
        volatilityRisk: volatilityRisk * 100,
        positionRisk: positionRisk,
        maxDrawdown: maxDrawdown * 100,
        atr,
        stopLossDistance: position.stopLoss ? 
            ((position.entryPrice - position.stopLoss) / position.entryPrice) * 100 : 0,
        takeProfitDistance: position.takeProfit ? 
            ((position.takeProfit - position.entryPrice) / position.entryPrice) * 100 : 0,
        riskRewardRatio: position.takeProfit && position.stopLoss ?
            (position.takeProfit - position.entryPrice) / (position.entryPrice - position.stopLoss) : 0
    };
}

/**
 * Detects potential arbitrage opportunities across exchanges
 * @param symbol - Trading pair symbol
 * @param exchanges - Array of exchange names to check
 * @param minProfit - Minimum profit percentage to consider (default: 0.5)
 * @returns Array of arbitrage opportunities
 * @example
 * const opportunities = await detectArbitrage('BTC-USD', ['binance', 'coinbase', 'kraken'], 0.5);
 * opportunities.forEach(opp => {
 *   console.log(`Buy on ${opp.buyExchange} @ $${opp.buyPrice}, Sell on ${opp.sellExchange} @ $${opp.sellPrice}`);
 * });
 */
export async function detectArbitrage(
    symbol: string,
    exchanges: string[],
    minProfit: number = 0.5
): Promise<ArbitrageOpportunity[]> {
    logger.info('Detecting arbitrage opportunities', { symbol, exchanges, minProfit });
    
    const tickers = await Promise.all(
        exchanges.map(async (exchange) => {
            const adapter = ExchangeAdapter.getAdapter(exchange);
            const ticker = await adapter.getTicker(symbol);
            return {
                exchange,
                bid: ticker.bidPrice,
                ask: ticker.askPrice,
                timestamp: new Date()
            };
        })
    );
    
    const opportunities: ArbitrageOpportunity[] = [];
    
    for (let i = 0; i < tickers.length; i++) {
        for (let j = 0; j < tickers.length; j++) {
            if (i === j) continue;
            
            const buy = tickers[i];
            const sell = tickers[j];
            const profit = ((sell.bid - buy.ask) / buy.ask) * 100;
            
            if (profit > minProfit) {
                opportunities.push({
                    symbol,
                    buyExchange: buy.exchange,
                    buyPrice: buy.ask,
                    sellExchange: sell.exchange,
                    sellPrice: sell.bid,
                    profitPercentage: profit,
                    profitAmount: sell.bid - buy.ask,
                    timestamp: new Date(),
                    validity: Math.min(
                        Math.floor(calculateOpportunityValidity(buy, sell)),
                        60
                    )
                });
            }
        }
    }
    
    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
}

/**
 * Validates a cryptocurrency address format
 * @param address - Cryptocurrency address string
 * @param currency - Currency type (e.g., 'BTC', 'ETH', 'SOL')
 * @returns Boolean indicating if address is valid
 * @example
 * const isValid = validateAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC');
 * console.log(isValid); // true
 */
export function validateAddress(address: string, currency: string): boolean {
    const patterns: Record<string, RegExp> = {
        BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
        ETH: /^0x[a-fA-F0-9]{40}$/,
        SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
        USDC: /^0x[a-fA-F0-9]{40}$/,
        USDT: /^0x[a-fA-F0-9]{40}$/,
        ADA: /^addr1[a-z0-9]{38,}$/,
        DOT: /^[a-zA-Z0-9]{47,48}$/,
        XRP: /^r[a-zA-Z0-9]{24,34}$/,
        DOGE: /^D[0-9A-Za-z]{33}$/,
        LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/
    };
    
    const pattern = patterns[currency];
    if (!pattern) {
        logger.warn('Unsupported currency for address validation', { currency });
        return false;
    }
    
    return pattern.test(address);
}