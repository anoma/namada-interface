use namada::types::{address::Address, token, transaction::pos};
use borsh::{BorshSerialize, BorshDeserialize};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct BondingMsg {
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
    pub fn new(
        msg: Vec<u8>,
    ) -> Result<Bond, String> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))?;
        let BondingMsg { source, validator, amount } = msg;

        let source = Address::from_str(&source).expect("Address from string should not fail");
        let validator = Address::from_str(&validator).expect("Address from string should not fail");
        let amount = token::Amount::from(amount);

        let bond = pos::Bond {
            validator,
            amount,
            source: Some(source),
        };

        let tx_data = bond.try_to_vec().expect("Encoding tx data shouldn't fail");

        Ok(Bond {
            tx_data,
        })
    }

    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let serialized = JsValue::from_serde(&self)
            .map_err(|err| err.to_string())?;
        Ok(serialized)
    }
}
