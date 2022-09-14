use crate::types::transaction::Transaction;
use namada::types::{address::Address, token};
use borsh::BorshSerialize;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Transfer {
    token: Address,
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Transfer {
    #[wasm_bindgen(constructor)]
    pub fn new(
        source: String,
        target: String,
        token: String,
        amount: f32,
    ) -> Self {
        let source = Address::from_str(&source).expect("Address from string should not fail");
        let target = Address::from_str(&target).expect("Address from string should not fail");
        let token = Address::from_str(&token).expect("Address from string should not fail");
        let amount = token::Amount::from(amount as u64);

        let transfer = token::Transfer {
            source,
            target,
            token: token.clone(),
            amount,
        };

        let tx_data = transfer
            .try_to_vec()
            .expect("Encoding unsigned transfer shouldn't fail");

        Self {
            token,
            tx_data,
        }
    }

    pub fn to_tx(
        &self,
        secret: String,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let tx_data = self.tx_data.clone();
        let token = self.token.clone();
        let transaction =
            match Transaction::new(secret, token, epoch, fee_amount, gas_limit, tx_code, tx_data) {
                Ok(transaction) => transaction,
                Err(error) => return Err(error),
            };

        // Return serialized Transaction
        Ok(JsValue::from_serde(&transaction).unwrap())
    }
}
