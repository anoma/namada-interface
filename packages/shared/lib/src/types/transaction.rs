use crate::types::{
    tx::Tx,
    wrapper::WrapperTx,
};
use namada::types::{key::{self, common::SecretKey}, address::Address};
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use std::str::FromStr;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Transaction {
    hash: String,
    bytes: Vec<u8>,
}

impl Transaction {
    pub fn new(
        secret: String,
        token: Address,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
        data: Vec<u8>,
    ) -> Result<Transaction, JsValue> {
        let signing_key = SecretKey::Ed25519(key::ed25519::SecretKey::from_str(&secret).unwrap());
        let tx = Tx::to_proto(
            tx_code,
            data,
        ).sign(&signing_key);

        let wrapper_tx = WrapperTx::wrap(
            token,
            fee_amount,
            String::from(&secret),
            epoch,
            gas_limit,
            tx,
        );

        let hash = wrapper_tx.tx_hash.to_string();
        let wrapper_tx = WrapperTx::sign(wrapper_tx, String::from(&secret));
        let bytes = wrapper_tx.to_bytes();

        // Return serialized wrapped & signed transaction as bytes with hash
        // in a tuple:
        Ok(Transaction {
            hash,
            bytes,
        })
    }
}
