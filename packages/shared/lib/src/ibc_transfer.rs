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
use namada::types::token;
use core::ops::Add;
use core::time::Duration;
use serde::{Deserialize, Serialize};
use borsh::{BorshSerialize, BorshDeserialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;
use prost::Message;
use prost_types::Any;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct IbcTransferMsg {
    source_port: String,
    source_channel: String,
    token: String,
    sender: String,
    receiver: String,
    amount: u64,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct IbcTransfer {
    tx_data: Vec<u8>
}

#[wasm_bindgen]
impl IbcTransfer {
    #[wasm_bindgen(constructor)]
    pub fn new(msg: &[u8]) -> Result<IbcTransfer, String> {
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))?;

        let IbcTransferMsg {
            source_port,
            source_channel,
            token,
            sender,
            receiver,
            amount,
        } = msg;

        let source_port = PortId::from_str(&source_port)
            .map_err(|err| err.to_string())?;
        let source_channel = ChannelId::from_str(&source_channel)
            .map_err(|err| err.to_string())?;

        let transfer_token = Some(Coin {
            denom: token,
            amount: format!("{}", amount / token::SCALE),
        });
        let timestamp_nanos: u64 = utils::get_timestamp()
            .0
            .timestamp_nanos()
            .try_into()
            .expect("Nano conversion from i64 to u64 should not fail");
        let timeout_duration = Duration::from_secs(30);

        let msg = MsgTransfer {
            source_port,
            source_channel,
            token: transfer_token,
            sender: Signer::from_str(&sender).map_err(|err| err.to_string())?,
            receiver: Signer::from_str(&receiver).map_err(|err| err.to_string())?,
            timeout_height: Height::new(0, 0),
            // Optionally, set timeout_timestamp to 0 for no timeout, e.g.:
            // timeout_timestamp: Timestamp::none(),
            timeout_timestamp: Timestamp::from_nanoseconds(timestamp_nanos)
                .expect("Shouldn't fail creating timestamp from nanoseconds")
                .add(timeout_duration)
                .expect("Shouldn't fail adding duration to timestamp"),
        };

        let msg = msg.to_any();
        let mut tx_data = vec![];
        Any::encode(&msg, &mut tx_data)
            .map_err(|err| err.to_string())?;

        Ok(IbcTransfer {
            tx_data
        })
    }

    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let serialized = JsValue::from_serde(&self)
            .map_err(|err| err.to_string())?;
        Ok(serialized)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_ibc_transfer() {
        let sender = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let receiver = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let source_port = String::from("transfer");
        let source_channel = String::from("channel-0");
        let amount = 1000;

        let msg = IbcTransferMsg {
            source_port,
            source_channel,
            sender,
            receiver,
            token,
            amount,
        };
        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize");

        let IbcTransfer { tx_data } = IbcTransfer::new(&msg_serialized)
            .expect("IbcTransfer should instantiate");

        assert_eq!(tx_data.len(), 342);
    }
}
