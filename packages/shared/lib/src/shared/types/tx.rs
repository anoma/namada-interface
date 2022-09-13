use crate::utils;
use namada::proto;
use wasm_bindgen::prelude::*;

// TODO: Remove following macro
#[allow(dead_code)]
#[wasm_bindgen]
pub struct Tx {
    tx_code: Vec<u8>,
    data: Vec<u8>,
}

#[wasm_bindgen]
impl Tx {
    #[wasm_bindgen(constructor)]
    pub fn new(tx_code: Vec<u8>, data: Vec<u8>) -> Tx {
        Tx {
            tx_code,
            data
        }
    }

    // TODO: Implement
    #[allow(unused_variables)]
    pub fn sign(&self, signing_key: Vec<u8>) -> Tx {
        Tx {
            tx_code: self.tx_code.clone(),
            data: self.data.clone(),
        }
    }

    // NOTE: The following cannot be exported via wasm_bindgen.
    // This should remain internal
    #[allow(dead_code)]
    fn to_proto_tx(&self) -> proto::Tx {
        proto::Tx {
            code: self.tx_code.clone(),
            data: Some(self.data.clone()),
            timestamp: utils::get_timestamp(),
        }
    }
}
