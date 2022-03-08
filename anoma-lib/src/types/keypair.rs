use std::convert::{TryFrom};
use anoma::types::key::ed25519::{Keypair as NativeKeypair};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Keypair(pub(crate) NativeKeypair);

impl From<NativeKeypair> for Keypair {
    fn from(native_keypair: NativeKeypair) -> Self {
        Keypair(native_keypair)
    }
}

impl TryFrom<JsValue> for Keypair {
    type Error = JsValue;

    fn try_from(value: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(value).map_err(|err| JsValue::from_str(&err.to_string()))
    }
}

#[wasm_bindgen]
impl Keypair {
    #[wasm_bindgen]
    pub fn serialize(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self).unwrap()
    }

    #[wasm_bindgen]
    pub fn deserialize(js_data: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(js_data).map_err(|err| JsValue::from_str(&err.to_string()))
    }

    #[wasm_bindgen]
    pub fn to_bytes(self) -> Box<[u8]> {
        Box::new(self.0.to_bytes())
    }
}
