use crate::types::transaction::Transaction;
use anoma::types::{
    address::Address,
    key::{
        self,
        common::{PublicKey, SecretKey},
        RefTo,
    },
    transaction::InitAccount,
};
use borsh::BorshSerialize;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Account(Transaction);

#[wasm_bindgen]
impl Account {
    /// Initialize an account on the Ledger
    pub fn init(
        secret: String,
        token: String,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
        vp_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let signing_key = SecretKey::Ed25519(key::ed25519::SecretKey::from_str(&secret).unwrap());
        let token = Address::from_str(&token).unwrap();
        let tx_code: Vec<u8> = tx_code.to_vec();
        let vp_code: Vec<u8> = vp_code.to_vec();
        let public_key = PublicKey::from(signing_key.ref_to());

        let data = InitAccount {
            public_key,
            vp_code: vp_code.clone(),
        };
        let data = data.try_to_vec().expect("Encoding tx data shouldn't fail");

        let transaction =
            match Transaction::new(secret, token, epoch, fee_amount, gas_limit, tx_code, data) {
                Ok(transaction) => transaction,
                Err(error) => return Err(error),
            };

        // Return serialized Transaction
        Ok(JsValue::from_serde(&Account(transaction)).unwrap())
    }
}
