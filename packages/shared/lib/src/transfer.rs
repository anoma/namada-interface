use namada::types::{address::Address, token};
use borsh::{BorshSerialize, BorshDeserialize};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct TransferMsg {
    source: String,
    target: String,
    token: String,
    amount: u64,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Transfer {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Transfer {
    #[wasm_bindgen(constructor)]
    pub fn new(
        msg: Vec<u8>,
    ) -> Result<Transfer, String> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| err.to_string())?;
        let TransferMsg { source, target, token, amount } = msg;

        let source = Address::from_str(&source).expect("Address from string should not fail");
        let target = Address::from_str(&target).expect("Address from string should not fail");
        let token = Address::from_str(&token).expect("Address from string should not fail");
        let amount = token::Amount::from(amount);

        let transfer = token::Transfer {
            source,
            target,
            token,
            amount,
        };

        let tx_data = transfer
            .try_to_vec()
            .map_err(|err| err.to_string())?;

        Ok(Transfer {
            tx_data,
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
    fn can_generate_transfer_transaction() {
        let source = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let target = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let amount = 1000;
        let epoch = 5;
        let fee_amount = 1000;
        let gas_limit = 1_000_000;

        let tx_code = vec![];
        let msg = TransferMsg { source, target, token: token.clone(), amount };

        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize");
        let Transfer { tx_data } = Transfer::new(msg_serialized)
            .expect("Transfer should be able to instantiate from Borsh-serialized message");

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
        assert_eq!(bytes.len(), 596);
    }
}
