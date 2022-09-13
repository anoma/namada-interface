#[allow(unused_imports)]
use crate::shared::types::{
    tx::Tx,
    wrapper::WrapperTx,
};
use namada::types::address::Address;
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Transaction {
    hash: String,
    bytes: Vec<u8>,
}

// TODO: Implement
#[allow(unused_variables)]
impl Transaction {
    pub fn new(
        secret: Vec<u8>,
        token: Address,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
        data: Vec<u8>,
    ) -> Result<Transaction, JsValue> {
        let tx = Tx::new(
            tx_code,
            data,
        ).sign(secret);

        // Return serialized wrapped & signed transaction as bytes with hash
        // in a tuple:
        Ok(Transaction {
            hash: "".into(),
            bytes: vec![0],
        })
    }
}
