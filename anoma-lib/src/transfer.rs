use crate::types::{
    address::Address,
    transaction::Transaction,
};
use anoma::types::{token};
use borsh::BorshSerialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Transfer(Transaction);

#[wasm_bindgen]
impl Transfer {
    pub fn new(
        serialized_keypair: JsValue,
        encoded_source: String,
        encoded_target: String,
        token: String,
        amount: u32,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let source = Address::decode(encoded_source)?;
        let target = Address::decode(encoded_target)?;
        let token = Address::decode(token)?;
        let amount = token::Amount::from(u64::from(amount));
        let tx_code: Vec<u8> = tx_code.to_vec();

        let transfer = token::Transfer {
            source: source.0,
            target: target.0,
            token: token.0.clone(),
            amount,
        };

        let data = transfer
            .try_to_vec()
            .expect("Encoding unsigned transfer shouldn't fail");

        // Return serialized Transaction
        Ok(JsValue::from_serde(&Transaction::new(
            serialized_keypair,
            token,
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
            data
        ).unwrap()).unwrap())
    }
}
