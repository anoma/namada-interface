use borsh::BorshSerialize;
use gloo_utils::format::JsValueSerdeExt;
use namada::types::key::{
    self,
    common::{PublicKey, SecretKey},
    RefTo,
};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct RevealPk {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl RevealPk {

    #[wasm_bindgen(constructor)]
    pub fn new(private_key: &str) -> Result<RevealPk, String> {
        let secret_key = key::ed25519::SecretKey::from_str(private_key)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))?;
        let signing_key = SecretKey::Ed25519(secret_key);

        let public_key = PublicKey::from(signing_key.ref_to());

        let tx_data = public_key.try_to_vec().map_err(|err| err.to_string())?;

        Ok(RevealPk { tx_data })
    }

    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let serialized = JsValue::from_serde(&self).map_err(|err| err.to_string())?;
        Ok(serialized)
    }
}

