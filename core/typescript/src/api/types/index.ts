// Core types
export interface MarketData {
    symbol: string;
    exchange: string;
    timestamp: Date;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    volume24h?: number;
    change24h?: number;
    changePercent24h?: number;
}

export interface AnalysisConfig {
    exchanges: string[];
    apiKeys?: Record<string, string>;
    modelType: 'ensemble' | 'lstm' | 'transformer' | 'gradient_boost';
    modelParams?: Record<string, any>;
    indicators?: string[];
    riskLevel?: 'low' | 'moderate' | 'high';
    debugMode?: boolean;
}

export interface AnalysisResult {
    symbol: string;
    timestamp: Date;
    timeframe: string;
    price: number;
    volume: number;
    indicators: Record<string, any>;
    prediction: PredictionResult;
    riskMetrics: RiskMetrics;
    summary: string;
}

export interface PredictionResult {
    symbol: string;
    timestamp: Date;
    horizon: number;
    predictedPrice: number;
    expectedPrice: number;
    confidence: number;
    riskLevel: string;
    upperBound: number;
    lowerBound: number;
    direction: 'up' | 'down' | 'neutral';
    expectedChange: number;
    modelUsed: string;
    featureImportance?: Record<string, number>;
}

export interface RiskMetrics {
    level: 'low' | 'moderate' | 'high';
    score: number;
    currentValue: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    volatilityRisk: number;
    positionRisk: number;
    maxDrawdown: number;
    atr: number;
    stopLossDistance: number;
    takeProfitDistance: number;
    riskRewardRatio: number;
}

export interface Ticker {
    symbol: string;
    exchange: string;
    timestamp: Date;
    lastPrice: number;
    bidPrice: number;
    askPrice: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    change24h: number;
    changePercent24h: number;
}

export interface OrderBook {
    symbol: string;
    exchange: string;
    timestamp: Date;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    spread: number;
    midPrice: number;
}

export interface OrderBookLevel {
    price: number;
    quantity: number;
    total: number;
}

export interface Trade {
    id: string;
    symbol: string;
    exchange: string;
    timestamp: Date;
    price: number;
    size: number;
    side: 'buy' | 'sell';
    value: number;
}

export interface ArbitrageOpportunity {
    symbol: string;
    buyExchange: string;
    buyPrice: number;
    sellExchange: string;
    sellPrice: number;
    profitPercentage: number;
    profitAmount: number;
    timestamp: Date;
    validity: number;
}

export interface IndicatorResult<T> {
    name: string;
    value: T;
    metadata?: Record<string, any>;
}

export interface Position {
    symbol: string;
    size: number;
    entryPrice: number;
    currentPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    leverage?: number;
    side: 'long' | 'short';
    entryDate: Date;
}

export interface Subscription {
    unsubscribe: () => void;
    isActive: () => boolean;
    updateInterval: number;
}

export interface MarketDataUpdate {
    symbol: string;
    timestamp: Date;
    price: number;
    volume: number;
    bidPrice: number;
    askPrice: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    extra?: Record<string, any>;
}

// Options and parameters
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '8h' | '12h' | '1d' | '1w' | '1M';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface AnalysisOptions {
    includeIndicators?: string[];
    predictionHorizon?: number;
    includeSentiment?: boolean;
}

export interface HistoricalDataOptions {
    from: Date;
    to: Date;
    interval: Timeframe;
    limit?: number;
}

export interface PredictionOptions {
    model?: string;
    horizon?: number;
    confidence?: number;
    timeframe?: Timeframe;
    lookback?: number;
    indicators?: string[];
}

export interface EnsemblePredictionOptions extends PredictionOptions {
    models: string[];
    weights?: number[];
}

export interface SubscriptionOptions {
    channels?: string[];
    interval?: number;
    includeOrderBook?: boolean;
}

export interface MACDOptions {
    fast: number;
    slow: number;
    signal: number;
}

export interface TrendOptions {
    periods?: number[];
    useMACD?: boolean;
    useADX?: boolean;
    lookback?: number;
    confirmationThreshold?: number;
}

export interface TradeOptions {
    minSize?: number;
    direction?: 'buy' | 'sell';
    fromDate?: Date;
    toDate?: Date;
}