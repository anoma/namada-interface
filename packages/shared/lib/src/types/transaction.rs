use crate::types::{
    tx::Tx,
    wrapper::WrapperTx,
};
use std::str::FromStr;
use namada::types::{key::{self, common::SecretKey}, address::Address, transaction};
use serde::{Serialize, Deserialize};
use borsh::{BorshSerialize, BorshDeserialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct TransactionMsg {
    secret: String,
    token: String,
    epoch: u32,
    fee_amount: u32,
    gas_limit: u32,
    tx_code: Vec<u8>,
}

#[wasm_bindgen]
impl TransactionMsg {
    #[wasm_bindgen(constructor)]
    pub fn new(
        secret: String,
        token: String,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
        ) -> Self {
        Self {
            secret,
            token,
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
        }
    }
}

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
        msg: Vec<u8>,
        tx_data: &Vec<u8>,
    ) -> Result<Transaction, JsValue> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| err.to_string())?;
        let TransactionMsg {
            secret,
            epoch,
            token,
            fee_amount,
            gas_limit,
            tx_code,
        } = msg;

        let secret_key = key::ed25519::SecretKey::from_str(&secret).
            map_err(|err| err.to_string())?;
        let secret_key = SecretKey::Ed25519(secret_key);
        let token = Address::from_str(&token)
            .map_err(|err| err.to_string())?;

        // Create and sign inner Tx
        let tx = Tx::to_proto(
            tx_code,
            tx_data.to_owned(),
        ).sign(&secret_key);

        // Wrap Tx
        let wrapper_tx = WrapperTx::wrap(
            token,
            fee_amount,
            secret.clone(),
            epoch,
            gas_limit,
            tx,
        );

        Ok(Transaction {
            secret,
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
