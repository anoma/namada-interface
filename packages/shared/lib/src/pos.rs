use borsh::BorshDeserialize;
use serde::{Deserialize, Serialize};
use namada::ledger::pos::types::WeightedValidator;
use namada::ledger::pos::ValidatorSets;
use namada::types::address::Address;

use wasm_bindgen::prelude::*;
use serde_wasm_bindgen;

#[derive(Serialize, Deserialize)]
pub struct SerializableValidator {
    pub voting_power: u64,
    pub address: String,
}

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Validators {
    pub(crate) active: Vec<SerializableValidator>,
    pub(crate) inactive: Vec<SerializableValidator>,
}

fn get_validators_from_validator_sets(weighted_validator: &WeightedValidator<Address>) -> SerializableValidator {
    SerializableValidator {
        address: weighted_validator.address.encode(),
        voting_power: u64::from(weighted_validator.voting_power)
    }
}

#[wasm_bindgen]
impl Validators {
    #[wasm_bindgen]
    pub fn decode(validator_sets_byte_array: &[u8]) -> Result<JsValue, JsValue> {
        let a = ValidatorSets::try_from_slice(validator_sets_byte_array);
        let b = match a {
            Ok(v) => v.get(0).unwrap().clone(),
            Err(_) => return Err(JsValue::from("net overflow")),
        };

        let c = Validators {
            active: b.active.iter().map(get_validators_from_validator_sets).collect(),
            inactive: b.inactive.iter().map(get_validators_from_validator_sets).collect()
        };

        match serde_wasm_bindgen::to_value(&c) {
            Ok(v) => Ok(v),
            Err(_) => return Err(JsValue::from("net overflow"))
        }
    }
}
