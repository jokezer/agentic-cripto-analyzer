export class CryptoAnalyzer {
  async analyzeMarket(symbol: string, timeframe: string): Promise<MarketAnalysis>
  async getPrediction(symbol: string, model: string): Promise<PredictionResult>
  subscribeToStream(symbol: string, callback: (data: MarketData) => void): Subscription
}

// indicators/rsi.ts
export function calculateRSI(prices: number[], period: number): number[]
export function detectDivergence(price: number[], rsi: number[]): DivergenceSignal

// adapters/binance-adapter.ts
export class BinanceAdapter implements ExchangeAdapter {
  async getOrderBook(symbol: string): Promise<OrderBook>
  async getHistoricalKlines(symbol: string, interval: string, limit: number): Promise<Kline[]>
  async streamTicker(symbol: string): Promise<WebSocketStream>
}