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
    pub fn new(msg: Vec<u8>) -> Result<IbcTransfer, String> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| err.to_string())?;
        let IbcTransferMsg { source_port, source_channel, token, sender, receiver, amount  } = msg;

        let source_port = PortId::from_str(&source_port).unwrap();
        let source_channel = ChannelId::from_str(&source_channel).unwrap();

        let transfer_token = Some(Coin {
            denom: token,
            amount: format!("{}", amount / token::SCALE),
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
    use crate::types::transaction::{SerializedTx, TransactionMsg};
    use crate::types::signer::Signer;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_ibc_transfer_transaction() {
        let sender = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let receiver = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let source_port = String::from("transfer");
        let source_channel = String::from("channel-0");
        let amount = 1000;
        let epoch = 5;
        let fee_amount = 1000;
        let gas_limit = 1_000_000;

        let tx_code = vec![];

        let msg = IbcTransferMsg { source_port, source_channel, sender, receiver, token: token.clone(), amount };
        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize");

        let IbcTransfer { tx_data } = IbcTransfer::new(msg_serialized)
            .expect("IbcTransfer should instantiate");

        let transaction_msg = TransactionMsg::new(token, epoch, fee_amount, gas_limit, tx_code);
        let transaction_msg_serialized = BorshSerialize::try_to_vec(&transaction_msg)
            .expect("Message should serialize");

        let signer = Signer::new(&tx_data);
        let transaction = signer.sign(&transaction_msg_serialized, secret)
            .expect("Should be able to convert to transaction");

        let serialized_tx: SerializedTx = JsValue::into_serde(&transaction)
            .expect("Should be able to serialize to a Transaction");

        let hash = serialized_tx.hash();
        let bytes = serialized_tx.bytes();

        assert_eq!(hash.len(), 64);
        assert_eq!(bytes.len(), 795);
    }
}
