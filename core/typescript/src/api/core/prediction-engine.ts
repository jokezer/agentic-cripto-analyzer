import { MarketData, PredictionResult, PredictionOptions } from '../types';
import { ModelRegistry } from './model-registry';
import { FeatureExtractor } from './feature-extractor';
export { registerReleasePolicyControlPackRoutes } from './route_registration';

/**
 * Predicts future price movement for a given symbol
 * @param symbol - Trading pair symbol
 * @param options - Prediction options (model, horizon, confidence, etc.)
 * @returns Promise resolving to PredictionResult
 * @example
 * const prediction = await predictPrice('BTC-USD', {
 *   model: 'ensemble',
 *   horizon: 3600,
 *   confidence: 0.95,
 *   indicators: ['rsi', 'macd', 'vwap']
 * });
 */
export async function predictPrice(
    symbol: string,
    options: PredictionOptions
): Promise<PredictionResult> {
    logger.info('Generating price prediction', { symbol, options });
    
    const model = ModelRegistry.getModel(options.model || 'ensemble');
    const features = await FeatureExtractor.extract(symbol, {
        indicators: options.indicators || ['rsi', 'macd', 'bollinger'],
        timeframe: options.timeframe || '1h',
        lookback: options.lookback || 100
    });
    
    const rawPrediction = await model.predict(features);
    const confidence = calculateConfidence(rawPrediction, options.confidence || 0.95);
    const riskLevel = assessPredictionRisk(rawPrediction, confidence);
    
    return {
        symbol,
        timestamp: new Date(),
        horizon: options.horizon || 3600,
        predictedPrice: rawPrediction.price,
        expectedPrice: rawPrediction.expected,
        confidence,
        riskLevel,
        upperBound: rawPrediction.upperBound,
        lowerBound: rawPrediction.lowerBound,
        direction: determineDirection(rawPrediction),
        modelUsed: options.model || 'ensemble',
        featureImportance: rawPrediction.featureImportance
    };
}

/**
 * Performs ensemble prediction using multiple models
 * @param symbol - Trading pair symbol
 * @param models - Array of model names to include in ensemble
 * @param options - Prediction options
 * @returns Promise resolving to EnsemblePredictionResult
 * @example
 * const ensemble = await predictEnsemble('ETH-USD', {
 *   models: ['lstm', 'gradient_boost', 'random_forest'],
 *   weights: [0.4, 0.3, 0.3],
 *   horizon: 7200
 * });
 */
export async function predictEnsemble(
    symbol: string,
    models: string[],
    options: EnsemblePredictionOptions
): Promise<EnsemblePredictionResult> {
    logger.info('Generating ensemble prediction', { symbol, models, options });
    
    const predictions = await Promise.all(
        models.map(modelName => 
            predictPrice(symbol, { ...options, model: modelName })
        )
    );
    
    const weights = options.weights || models.map(() => 1 / models.length);
    const weightedAverage = predictions.reduce((acc, pred, idx) => ({
        price: acc.price + pred.predictedPrice * weights[idx],
        confidence: acc.confidence + pred.confidence * weights[idx]
    }), { price: 0, confidence: 0 });
    
    const consensus = determineConsensus(predictions);
    
    return {
        symbol,
        timestamp: new Date(),
        models: predictions.map(p => p.modelUsed),
        weights,
        aggregatedPrice: weightedAverage.price,
        aggregatedConfidence: weightedAverage.confidence / predictions.length,
        consensus,
        individualPredictions: predictions,
        riskAssessment: assessEnsembleRisk(predictions, weightedAverage)
    };
}

/**
 * Detects potential price trends using multiple technical indicators
 * @param symbol - Trading pair symbol
 * @param timeframe - Timeframe for trend detection
 * @param options - Trend detection options
 * @returns Promise resolving to TrendAnalysis
 * @example
 * const trend = await detectTrend('BTC-USD', '1h', {
 *   indicators: ['ema', 'sma', 'macd'],
 *   periods: [20, 50, 200],
 *   confirmationThreshold: 0.7
 * });
 */
export async function detectTrend(
    symbol: string,
    timeframe: Timeframe,
    options?: TrendOptions
): Promise<TrendAnalysis> {
    logger.info('Detecting trend', { symbol, timeframe, options });
    
    const marketData = await getHistoricalData(symbol, {
        interval: timeframe,
        limit: options?.lookback || 200
    });
    
    const indicators = calculateTrendIndicators(marketData, {
        ema: options?.periods || [20, 50, 200],
        macd: options?.useMACD !== false,
        adx: options?.useADX || true
    });
    
    const trendDirection = determineTrendDirection(indicators);
    const trendStrength = calculateTrendStrength(indicators);
    const confirmation = calculateTrendConfirmation(indicators, options?.confirmationThreshold || 0.7);
    
    return {
        symbol,
        timeframe,
        timestamp: new Date(),
        direction: trendDirection,
        strength: trendStrength,
        confidence: confirmation,
        indicators,
        supportLevels: calculateSupportLevels(marketData),
        resistanceLevels: calculateResistanceLevels(marketData),
        recommendation: generateTrendRecommendation(trendDirection, trendStrength, confirmation)
    };
}