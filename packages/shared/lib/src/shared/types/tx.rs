use crate::utils;
use namada::proto;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Tx;

impl Tx {
    pub fn from_tx(tx_code: Vec<u8>, data: Vec<u8>) -> proto::Tx {
        proto::Tx {
            code: tx_code,
            data: Some(data),
            timestamp: utils::get_timestamp(),
        }
    }
}
