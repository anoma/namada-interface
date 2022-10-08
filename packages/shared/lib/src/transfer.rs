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
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))?;
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
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_transfer_transaction() {
        let source = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let target = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let amount = 1000;
        let msg = TransferMsg { source, target, token, amount };

        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize to vector");
        let Transfer { tx_data } = Transfer::new(msg_serialized)
            .expect("Transfer should be able to instantiate from Borsh-serialized message");

        assert_eq!(tx_data.len(), 143);
    }
}
