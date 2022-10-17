//! PaymentAddress - Provide wasm_bindgen bindings for shielded addresses
//! See @anoma/crypto for zip32 HD wallet functionality.
use std::str::FromStr;
use namada::types::masp;
use wasm_bindgen::prelude::*;

/// Wrap masp::ExtendedViewingKey
#[wasm_bindgen]
pub struct ExtendedViewingKey(pub (crate) masp::ExtendedViewingKey);

/// wasm_bindgen bindings for ExtendedViewingKey
#[wasm_bindgen]
impl ExtendedViewingKey {
    #[wasm_bindgen(constructor)]
    pub fn new(key: &str) -> Result<ExtendedViewingKey, String> {

        let vk = masp::ExtendedViewingKey::from_str(key)
            .map_err(|err| format!("{:?}", err))?;

        Ok(ExtendedViewingKey(vk))
    }

    pub fn as_string(&self) -> String {
        self.0.to_string()
    }
}

/// Wrap masp::ExtendedSpendingKey
#[wasm_bindgen]
pub struct ExtendedSpendingKey(pub (crate) masp::ExtendedSpendingKey);

/// wasm_bindgen bindings for ExtendedViewingKey
#[wasm_bindgen]
impl ExtendedSpendingKey {
    #[wasm_bindgen(constructor)]
    pub fn new(key: &str) -> Result<ExtendedSpendingKey, String> {

        let vk = masp::ExtendedSpendingKey::from_str(key)
            .map_err(|err| format!("{:?}", err))?;

        Ok(ExtendedSpendingKey(vk))
    }

    pub fn as_string(&self) -> String {
        self.0.to_string()
    }
}

/// Wrap masp::PaymentAddress
#[wasm_bindgen]
pub struct PaymentAddress(pub (crate) masp::PaymentAddress);

/// wasm_bindgen bindings for PaymentAddress
#[wasm_bindgen]
impl PaymentAddress {
    #[wasm_bindgen(constructor)]
    pub fn new(address: &str) -> Result<PaymentAddress, String> {
        let address = masp::PaymentAddress::from_str(address)
            .map_err(|err| err.to_string())?;
        Ok(PaymentAddress(address))
    }

    pub fn as_string(&self) -> String {
        self.0.to_string()
    }
}

