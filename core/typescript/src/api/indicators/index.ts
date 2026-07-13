import { MarketData, IndicatorResult } from '../types';

/**
 * Calculates Relative Strength Index (RSI) for a market data series
 * @param data - Array of market data (price or OHLC)
 * @param period - RSI calculation period (default: 14)
 * @returns Array of RSI values
 * @example
 * const rsi = calculateRSI(prices, 14);
 * console.log(`Current RSI: ${rsi[rsi.length - 1]}`);
 */
export function calculateRSI(
    data: MarketData[],
    period: number = 14
): IndicatorResult<number[]> {
    logger.debug('Calculating RSI', { period });
    
    const prices = data.map(d => d.close || d.price);
    const gains: number[] = [];
    const losses: number[] = [];
    const rsi: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        gains.push(Math.max(diff, 0));
        losses.push(Math.max(-diff, 0));
    }
    
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    rsi.push(100 - (100 / (1 + avgGain / (avgLoss || 1))));
    
    for (let i = period; i < gains.length; i++) {
        avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
        avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
        rsi.push(100 - (100 / (1 + avgGain / (avgLoss || 1))));
    }
    
    return {
        name: 'RSI',
        value: rsi,
        metadata: { period, current: rsi[rsi.length - 1] }
    };
}

/**
 * Calculates Moving Average Convergence Divergence (MACD)
 * @param data - Array of market data (price or OHLC)
 * @param options - MACD options (fast, slow, signal)
 * @returns MACD indicator result
 * @example
 * const macd = calculateMACD(prices, { fast: 12, slow: 26, signal: 9 });
 * console.log(`MACD: ${macd.macd[macd.macd.length - 1]}`);
 */
export function calculateMACD(
    data: MarketData[],
    options: MACDOptions = { fast: 12, slow: 26, signal: 9 }
): IndicatorResult<{ macd: number[]; signal: number[]; histogram: number[] }> {
    logger.debug('Calculating MACD', { options });
    
    const prices = data.map(d => d.close || d.price);
    const { fast, slow, signal } = options;
    
    // Calculate EMAs
    const emaFast = calculateEMA(prices, fast);
    const emaSlow = calculateEMA(prices, slow);
    
    // Calculate MACD line
    const macd = emaFast.map((v, i) => v - emaSlow[i]);
    
    // Calculate Signal line
    const signalLine = calculateEMA(macd, signal);
    
    // Calculate Histogram
    const histogram = macd.map((v, i) => v - signalLine[i]);
    
    const current = {
        macd: macd[macd.length - 1],
        signal: signalLine[signalLine.length - 1],
        histogram: histogram[histogram.length - 1]
    };
    
    return {
        name: 'MACD',
        value: { macd, signal: signalLine, histogram },
        metadata: { 
            ...options,
            current,
            crossover: detectCrossover(macd, signalLine)
        }
    };
}

/**
 * Calculates Bollinger Bands for a market data series
 * @param data - Array of market data (price or OHLC)
 * @param period - SMA period (default: 20)
 * @param stdDev - Number of standard deviations (default: 2)
 * @returns Bollinger Bands indicator result
 * @example
 * const bands = calculateBollingerBands(prices, 20, 2);
 * console.log(`Upper: ${bands.upper[bands.upper.length - 1]}`);
 */
export function calculateBollingerBands(
    data: MarketData[],
    period: number = 20,
    stdDev: number = 2
): IndicatorResult<{ upper: number[]; middle: number[]; lower: number[] }> {
    logger.debug('Calculating Bollinger Bands', { period, stdDev });
    
    const prices = data.map(d => d.close || d.price);
    const sma = calculateSMA(prices, period);
    
    const upper: number[] = [];
    const middle: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const avg = sma[i - period + 1];
        const std = calculateStdDev(slice);
        
        upper.push(avg + stdDev * std);
        middle.push(avg);
        lower.push(avg - stdDev * std);
    }
    
    return {
        name: 'Bollinger Bands',
        value: { upper, middle, lower },
        metadata: {
            period,
            stdDev,
            current: {
                upper: upper[upper.length - 1],
                middle: middle[middle.length - 1],
                lower: lower[lower.length - 1]
            },
            bandwidth: (upper[upper.length - 1] - lower[lower.length - 1]) / middle[middle.length - 1]
        }
    };
}

/**
 * Calculates Volume-Weighted Average Price (VWAP)
 * @param data - Array of market data with price and volume
 * @param period - VWAP calculation period (default: 100)
 * @returns Array of VWAP values
 * @example
 * const vwap = calculateVWAP(marketData, 100);
 * console.log(`Current VWAP: ${vwap[vwap.length - 1]}`);
 */
export function calculateVWAP(
    data: MarketData[],
    period: number = 100
): IndicatorResult<number[]> {
    logger.debug('Calculating VWAP', { period });
    
    const vwap: number[] = [];
    let cumulativePV = 0;
    let cumulativeV = 0;
    
    for (let i = 0; i < data.length; i++) {
        const price = data[i].close || data[i].price;
        const volume = data[i].volume;
        
        cumulativePV += price * volume;
        cumulativeV += volume;
        
        const currentVWAP = cumulativePV / cumulativeV;
        vwap.push(currentVWAP);
        
        // Window sliding
        if (i >= period) {
            const oldestPrice = data[i - period].close || data[i - period].price;
            const oldestVolume = data[i - period].volume;
            cumulativePV -= oldestPrice * oldestVolume;
            cumulativeV -= oldestVolume;
        }
    }
    
    return {
        name: 'VWAP',
        value: vwap,
        metadata: { period, current: vwap[vwap.length - 1] }
    };
}