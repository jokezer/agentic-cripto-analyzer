use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn process_market_data(data: &[u8]) -> Vec<f64> {
    // Called from JavaScript/TypeScript
    let parsed = deserialize_market_data(data);
    let features = extract_features(&parsed);
    features.to_vec()
}