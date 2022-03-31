use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Keypair {
    secret: Vec<u8>,
    public: Vec<u8>,
}

#[wasm_bindgen]
impl Keypair {
    pub fn from_pointer_to_js_value(&self) -> JsValue {
        JsValue::from_serde(self).unwrap()
    }

    #[wasm_bindgen]
    pub fn from_js_value_to_pointer(js_data: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(js_data).map_err(|err| JsValue::from_str(&err.to_string()))
    }

    #[wasm_bindgen]
    pub fn secret(&self) -> Vec<u8> {
        self.secret.clone()
    }

    #[wasm_bindgen]
    pub fn to_bytes(&self) -> Vec<u8> {
        let mut bytes: [u8; ed25519_dalek::KEYPAIR_LENGTH] =
            [0u8; ed25519_dalek::KEYPAIR_LENGTH];

        let secret: &[u8] = &self.secret.to_vec();
        let public: &[u8] = &self.public.to_vec();

        bytes[..ed25519_dalek::SECRET_KEY_LENGTH]
            .copy_from_slice(&secret);
        bytes[ed25519_dalek::SECRET_KEY_LENGTH..]
            .copy_from_slice(&public);
        bytes.to_vec()
    }
}
