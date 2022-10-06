use crate::types::transaction::Transaction;

use gloo_utils::format::JsValueSerdeExt;
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize,Deserialize)]
pub struct Signer {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Signer {
    #[wasm_bindgen(constructor)]
    pub fn new(tx_data: &[u8]) -> Signer {
        Signer {
            tx_data: Vec::from(tx_data),
        }
    }

    pub fn sign(
        &self,
        msg: &[u8],
        secret: String,
    ) -> Result<JsValue, JsValue> {
        let transaction = Transaction::new(Vec::from(msg), secret, &self.tx_data)?;
        Ok(JsValue::from_serde(&transaction.serialize()).unwrap())
    }
}

