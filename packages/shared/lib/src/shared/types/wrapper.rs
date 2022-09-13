use crate::shared::types::tx::Tx;
#[allow(unused_imports)]
use namada::types::transaction;

use wasm_bindgen::prelude::*;

#[allow(dead_code)]
#[wasm_bindgen]
pub struct WrapperTx {
    token: String,
    fee_amount: u32,
    secret: String,
    epoch: u32,
    gas_limit: u32,
    tx: Tx,
}

// TODO: Implement
#[wasm_bindgen]
impl WrapperTx {
    #[wasm_bindgen(constructor)]
    pub fn new(
        token: String,
        fee_amount: u32,
        secret: String,
        epoch: u32,
        gas_limit: u32,
        tx: Tx,
    ) -> WrapperTx {
        WrapperTx {
            token,
            fee_amount,
            secret,
            epoch,
            gas_limit,
            tx,
        }
    }

    // TODO: Implement
    #[allow(unused_variables)]
    pub fn sign(self, secret: Vec<u8>) -> WrapperTx {
        self
    }
}
