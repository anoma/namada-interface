use crate::types::transaction::Transaction;
use crate::utils;

use namada::ibc::{
    applications::ics20_fungible_token_transfer::msgs::transfer::MsgTransfer,
    core::{
        ics02_client::height::Height,
        ics24_host::identifier::{ChannelId, PortId},
    },
    signer::Signer,
    timestamp::Timestamp,
    tx_msg::Msg,
};
use namada::ibc_proto::cosmos::base::v1beta1::Coin;
use namada::types::address::Address;

use core::ops::Add;
use core::time::Duration;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;
use prost::Message;
use prost_types::Any;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct IbcTransfer {
    token: String,
    tx_data: Vec<u8>
}

#[wasm_bindgen]
impl IbcTransfer {
    #[wasm_bindgen(constructor)]
    pub fn new(
            source_port: String,
            source_channel: String,
            token: String,
            sender: String,
            receiver: String,
            amount: f32,
        ) -> Self {
        let source_port = PortId::from_str(&source_port).unwrap();
        let source_channel = ChannelId::from_str(&source_channel).unwrap();

        let transfer_token = Some(Coin {
            denom: token.clone(),
            amount: format!("{}", amount),
        });
        let timestamp_nanos = utils::get_timestamp().0.timestamp_nanos() as u64;
        let timeout_duration = Duration::from_secs(30);

        let msg = MsgTransfer {
            source_port,
            source_channel,
            token: transfer_token,
            sender: Signer::from_str(&sender).unwrap(),
            receiver: Signer::from_str(&receiver).unwrap(),
            timeout_height: Height::new(0, 0),
            // Optionally, set timeout_timestamp to 0 for no timeout, e.g.:
            // timeout_timestamp: Timestamp::none(),
            timeout_timestamp: Timestamp::from_nanoseconds(timestamp_nanos)
                .unwrap()
                .add(timeout_duration)
                .unwrap(),
        };

        let msg = msg.to_any();
        let mut tx_data = vec![];
        Any::encode(&msg, &mut tx_data).expect("encoding IBC message shouldn't fail");

        Self {
            token,
            tx_data
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
        let token = Address::from_str(&self.token).unwrap();
        let tx_code: Vec<u8> = tx_code.to_vec();
        let tx_data = self.tx_data.clone();

        let transaction =
            match Transaction::new(secret, token, epoch, fee_amount, gas_limit, tx_code, tx_data) {
                Ok(transaction) => transaction,
                Err(error) => return Err(error),
            };

        // Return a serialized IBC Transaction
        Ok(JsValue::from_serde(&transaction).unwrap())
    }
}
