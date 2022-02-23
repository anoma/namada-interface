use crate::utils;
use anoma::proto;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Tx(pub(crate) proto::Tx);

impl Tx {
    pub fn new(tx_code: Vec<u8>, data: Vec<u8>) -> proto::Tx {
        proto::Tx {
            code: tx_code,
            data: Some(data),
            timestamp: utils::get_timestamp(),
        }
    }
}
