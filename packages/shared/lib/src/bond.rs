use borsh::{BorshDeserialize, BorshSerialize};
use gloo_utils::format::JsValueSerdeExt;
use namada::types::{address::Address, token, transaction::pos};
use serde::{Deserialize, Serialize};
use std::str::FromStr;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct BondMsg {
    source: String,
    validator: String,
    amount: u64,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Bond {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Bond {
    #[wasm_bindgen(constructor)]
    pub fn new(msg: Vec<u8>) -> Result<Bond, String> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))?;
        let BondMsg {
            source,
            validator,
            amount,
        } = msg;

        let source = Address::from_str(&source).expect("Address from string should not fail");
        let validator = Address::from_str(&validator).expect("Address from string should not fail");
        let amount = token::Amount::from(amount);

        let bond = pos::Bond {
            validator,
            amount,
            source: Some(source),
        };

        let tx_data = bond.try_to_vec().expect("Encoding tx data shouldn't fail");

        Ok(Bond { tx_data })
    }

    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let serialized = JsValue::from_serde(&self).map_err(|err| err.to_string())?;
        Ok(serialized)
    }
}

pub type Unbond = Bond;

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_bond_tx() {
        let source = String::from("atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4");
        let validator = String::from("atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw");
        let amount = 1000;
        let msg = BondMsg { source, validator, amount };

        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize to vector");
        let Bond { tx_data } = Bond::new(msg_serialized)
            .expect("Transfer should be able to instantiate from Borsh-serialized message");

        assert_eq!(tx_data.len(), 99);
    }
}
