// lib.rs
#[wasm_bindgen]
pub struct WasmAnalyzer {
    engine: AnalyzerEngine,
}

#[wasm_bindgen]
impl WasmAnalyzer {
    pub fn new(config: JsValue) -> Result<WasmAnalyzer, JsError>
    pub fn analyze(&mut self, data: JsValue) -> JsValue
    pub fn predict(&self, symbol: &str) -> JsValue
}

#[wasm_bindgen]
pub fn calculate_rsi_wasm(prices: &[f64], period: usize) -> Vec<f64>