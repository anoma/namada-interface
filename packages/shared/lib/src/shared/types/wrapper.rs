use wasm_bindgen::prelude::*;

#[allow(dead_code)]
#[wasm_bindgen]
pub struct WrapperTx {
    token: String,
    fee_amount: u32,
    secret: String,
    epoch: u32,
    gas_limit: u32,
}

// TODO: Implement with the new EncryptedTx type
