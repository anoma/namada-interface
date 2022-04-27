use crate::types::{
    transaction::Transaction,
};
use anoma::types::{
    token,
    address::Address,
    ibc::data::{
        IbcMessage,
        FungibleTokenPacketData,
    },
};
use borsh::BorshSerialize;
use serde::{Serialize, Deserialize};
use std::str::FromStr;

use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct IbcTransfer(pub Transaction);

#[wasm_bindgen]
impl IbcTransfer {
    pub fn new(
        secret: String,
        sender: String,
        receiver: String,
        token: String,
        amount: u32,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let sender = Address::from_str(&sender).unwrap();
        let receiver = Address::from_str(&receiver).unwrap();
        let token = Address::from_str(&token).unwrap();

        let amount = token::Amount::from(u64::from(amount));
        let tx_code: Vec<u8> = tx_code.to_vec();

        // TODO: Remove the following, replace with IbcMessage
        let transfer = token::Transfer {
            source: sender.clone(),
            target: receiver.clone(),
            token: token.clone(),
            amount,
        };

        let transfer_data = FungibleTokenPacketData {
            amount: format!("{}", amount),
            sender: sender.encode(),
            receiver: receiver.encode(),
            denomination: String::from("XAN"),
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
        Ok(JsValue::from_serde(&IbcTransfer(transaction)).unwrap())
    }
}
