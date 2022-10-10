use crate::types::{
    tx::Tx,
    wrapper::WrapperTx,
};
use namada::types::{key::{self, common::SecretKey}, address::Address, transaction};
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use std::str::FromStr;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct SerializedTx {
    hash: String,
    bytes: Vec<u8>,
}

pub struct Transaction {
    secret: String,
    wrapper_tx: transaction::WrapperTx,
}

/// Sign and wrap transaction
impl Transaction {
    pub fn new(
        secret: &str,
        token: Address,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
        tx_data: &[u8],
    ) -> Result<Transaction, JsValue> {
        let secret_key = key::ed25519::SecretKey::from_str(secret).
            map_err(|err| err.to_string())?;
        let secret_key = SecretKey::Ed25519(secret_key);

        // Create and sign inner Tx
        let tx = Tx::to_proto(
            Vec::from(tx_code),
            Vec::from(tx_data),
        ).sign(&secret_key);

        // Wrap Tx
        let wrapper_tx = WrapperTx::wrap(
            token,
            fee_amount,
            String::from(secret),
            epoch,
            gas_limit,
            tx,
        );

        Ok(Transaction {
            secret: secret.to_string(),
            wrapper_tx
        })
    }

    pub fn serialize(&self) -> SerializedTx {
        let wrapper_tx = &self.wrapper_tx;
        let hash = wrapper_tx.tx_hash.to_string();
        let wrapper_tx = WrapperTx::sign(wrapper_tx.to_owned(), String::from(&self.secret));
        let bytes = wrapper_tx.to_bytes();

        SerializedTx {
            hash,
            bytes,
        }
    }
}

#[wasm_bindgen]
impl SerializedTx {
    pub fn hash(&self) -> String {
        self.hash.clone()
    }

    pub fn bytes(&self) -> Vec<u8> {
        self.bytes.clone()
    }
}
