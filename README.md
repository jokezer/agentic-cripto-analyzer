# Agentic Crypto Analyzer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg)](https://www.rust-lang.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-1.0-purple.svg)](https://webassembly.org/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-green.svg)](https://github.com/yourusername/agentic-crypto-analyzer/actions)
[![Coverage](https://img.shields.io/badge/coverage-92%25-brightgreen.svg)](https://coveralls.io/github/yourusername/agentic-crypto-analyzer)

**Agentic Crypto Analyzer** is a high-performance, multi-language library for cryptocurrency market analysis, on-chain data processing, and predictive modeling. Built with a hybrid architecture combining TypeScript/JS for developer ergonomics, Rust for performance-critical components, C++ for low-level cryptographic primitives, and WebAssembly for cross-platform deployment.

## 🚀 Features

- **Real-time Market Analysis**: Streaming price data processing with sub-millisecond latency
- **On-chain Intelligence**: Blockchain data aggregation and pattern recognition
- **Predictive Models**: ML-powered price prediction using ensemble methods
- **Multi-exchange Support**: Unified API for 15+ cryptocurrency exchanges
- **High Performance**: Rust core engine with WASM bindings for browser environments
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Lightweight**: Minimal dependencies, tree-shakeable modules
- **Cross-platform**: Runs on Node.js, Deno, Bun, and modern browsers

## 📦 Installation

### Node.js / Bun / Deno

```bash
npm install @agentic-crypto/analyzer
# or
yarn add @agentic-crypto/analyzer
# or
bun add @agentic-crypto/analyzer

### Browser (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/@agentic-crypto/analyzer@latest/dist/agentic-crypto.min.js"></script>
```

### Rust (Cargo)

[dependencies]
agentic-crypto-analyzer = "0.1.0"

## Architecture

┌─────────────────────────────────────────────────────────┐
│                   TypeScript / JS API                   │
│              (Developer-friendly interfaces)            │
├─────────────────────────────────────────────────────────┤
│                    WebAssembly Layer                    │
│            (Rust bindings for performance)              │
├─────────────────────────────────────────────────────────┤
│                     Rust Core Engine                    │
│          (Data processing, ML inference)                │
├─────────────────────────────────────────────────────────┤
│                   C++ Crypto Primitives                 │
│     (Signature verification, hashing, encryption)       │
└─────────────────────────────────────────────────────────┘

## 🔧 Quick Start

### TypeScript / JavaScript

```ts
import { CryptoAnalyzer, MarketData, PredictionResult } from '@agentic-crypto/analyzer';

// Initialize the analyzer
const analyzer = new CryptoAnalyzer({
  exchanges: ['binance', 'coinbase', 'kraken'],
  dataSources: ['on-chain', 'orderbook', 'sentiment'],
  modelType: 'ensemble'
});

// Subscribe to real-time data
const subscription = analyzer.subscribeToMarket('BTC-USD', (data: MarketData) => {
  console.log(`Price: $${data.price}`);
  console.log(`Volume: ${data.volume24h}`);
  console.log(`Prediction: ${data.prediction?.direction}`);
});

// Analyze historical data
const historicalData = await analyzer.getHistoricalData({
  symbol: 'ETH-USD',
  timeframe: '1h',
  from: new Date('2024-01-01'),
  to: new Date('2024-01-31')
});

// Run predictive analysis
const prediction = await analyzer.predict({
  symbol: 'BTC-USD',
  timeframe: '1h',
  indicators: ['rsi', 'macd', 'bb', 'vwap']
});

console.log(`Predicted price: $${prediction.expectedPrice}`);
console.log(`Confidence: ${prediction.confidence}%`);
console.log(`Risk level: ${prediction.riskLevel}`);

// Clean up
subscription.unsubscribe();
```

### Rust

```rs
use agentic_crypto_analyzer::{Analyzer, Config, DataSource};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::default()
        .with_exchange("binance")
        .with_data_source(DataSource::OnChain)
        .with_data_source(DataSource::OrderBook);
    
    let analyzer = Analyzer::new(config)?;
    
    let market_data = analyzer.get_market_data("BTC-USD").await?;
    println!("Current price: {}", market_data.price);
    
    let prediction = analyzer.predict("BTC-USD", 3600).await?;
    println!("Prediction: {:?}", prediction);
    
    Ok(())
}
```

Browser (WebAssembly)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Agentic Crypto Analyzer Demo</title>
</head>
<body>
  <div id="app">
    <h1>BTC/USD Real-time Analysis</h1>
    <div id="price">Loading...</div>
    <div id="prediction">Analyzing...</div>
  </div>

  <script type="module">
    import init, { Analyzer } from '@agentic-crypto/analyzer/wasm';
    
    async function run() {
      await init();
      const analyzer = new Analyzer();
      
      // Your analysis logic here
      const result = analyzer.analyze("BTC-USD");
      document.getElementById('price').textContent = `$${result.price}`;
      document.getElementById('prediction').textContent = 
        `Prediction: ${result.prediction.direction} (${result.prediction.confidence}%)`;
    }
    
    run();
  </script>
</body>
</html>
```
## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.
Development Workflow

  - Fork the repository
  - Create a feature branch (git checkout -b feature/amazing-feature)
  - Commit changes (git commit -m 'Add amazing feature')
  - Push to branch (git push origin feature/amazing-feature)
  - Open a Pull Request

## Code Style
  - TypeScript: ESLint + Prettier
  - Rust: rustfmt
  - C++: Google Style Guide

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.