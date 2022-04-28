use crate::types::transaction::Transaction;
use anoma::types::address::Address;
use anoma::ibc::{
    applications::ics20_fungible_token_transfer::msgs::transfer::MsgTransfer,
    core::{
        ics24_host::identifier::{PortId, ChannelId},
        ics02_client::height::Height,
    },
    signer::Signer,
    timestamp::Timestamp,
    tx_msg::Msg,
};
use anoma::ibc_proto::cosmos::base::v1beta1::Coin;
use crate::utils;
use serde::{Serialize, Deserialize};
use std::str::FromStr;
use core::time::Duration;
use core::ops::Add;

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
        source_port: String,
        source_channel: String,
        tx_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let source_port = PortId::from_str(&source_port).unwrap();
        let source_channel = ChannelId::from_str(&source_channel).unwrap();

        let msg = MsgTransfer {
            source_port,
            source_channel,
            token: Some(Coin { denom: token.clone(), amount: format!("{}", amount) }),
            sender: Signer::from_str(&sender).unwrap(),
            receiver: Signer::from_str(&receiver).unwrap(),
            timeout_height: Height::new(0, 0),
            timeout_timestamp: Timestamp::from_nanoseconds(
                utils::get_timestamp().0.timestamp_nanos() as u64
            )
                .unwrap()
                .add(Duration::from_secs(30)).unwrap(),
        };

        let msg = msg.to_any();
        let mut tx_data = vec![];
        prost::Message::encode(&msg, &mut tx_data)
            .expect("encoding IBC message shouldn't fail");

        let data: Vec<u8> = tx_data;

        let token = Address::from_str(&token).unwrap();
        let tx_code: Vec<u8> = tx_code.to_vec();

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
