use crate::types::transaction::Transaction;
use anoma::types::{token, address::Address};
use borsh::BorshSerialize;
use serde::{Serialize, Deserialize};
use std::str::FromStr;

use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Transfer(pub Transaction);

#[wasm_bindgen]
impl Transfer {
    pub fn new(
        secret: String,
        encoded_source: String,
        encoded_target: String,
        token: String,
        amount: u32,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let source = Address::from_str(&encoded_source).unwrap();
        let target = Address::from_str(&encoded_target).unwrap();
        let token = Address::from_str(&token).unwrap();

        let amount = token::Amount::from(u64::from(amount));
        let tx_code: Vec<u8> = tx_code.to_vec();

        let transfer = token::Transfer {
            source,
            target,
            token: token.clone(),
            amount,
            shielded: None,
        };

        let data = transfer
            .try_to_vec()
            .expect("Encoding unsigned transfer shouldn't fail");

        let transaction = match Transaction::new(
            secret,
            token,
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
            data
        ) {
            Ok(transaction) => transaction,
            Err(error) => return Err(error)
        };
    
        // Return serialized Transaction
        Ok(JsValue::from_serde(&Transfer(transaction)).unwrap())
    }
}
