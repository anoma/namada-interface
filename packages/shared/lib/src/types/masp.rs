//! PaymentAddress - Provide wasm_bindgen bindings for shielded addresses
//! See @anoma/crypto for zip32 HD wallet functionality.
use std::str::FromStr;
use namada::types::masp;
use masp_primitives::zip32;
use borsh::BorshDeserialize;
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Error)]
pub enum MaspError {
    #[error("PaymentAddress from_str failed!")]
    PaymentAddress,
    #[error("BorshDeserialize failed!")]
    BorshDeserialize,
}

/// Wrap masp::ExtendedViewingKey
#[wasm_bindgen]
pub struct ExtendedViewingKey(pub (crate) masp::ExtendedViewingKey);

/// wasm_bindgen bindings for ExtendedViewingKey
#[wasm_bindgen]
impl ExtendedViewingKey {
    #[wasm_bindgen(constructor)]
    pub fn new(key: &[u8]) -> Result<ExtendedViewingKey, String> {
        let xfvk: zip32::ExtendedFullViewingKey = BorshDeserialize::try_from_slice(key)
            .map_err(|err| format!("{}: {:?}", MaspError::BorshDeserialize, err))?;

        let vk = masp::ExtendedViewingKey::from(xfvk);

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
    pub fn new(key: &[u8]) -> Result<ExtendedSpendingKey, String> {
        let xsk: zip32::ExtendedSpendingKey = BorshDeserialize::try_from_slice(key)
            .map_err(|err| format!("{}: {:?}", MaspError::BorshDeserialize, err))?;

        let xsk = masp::ExtendedSpendingKey::from(xsk);

        Ok(ExtendedSpendingKey(xsk))
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
            .map_err(|err| format!("{}: {:?}", MaspError::PaymentAddress, err))?;
        Ok(PaymentAddress(address))
    }

    pub fn as_string(&self) -> String {
        self.0.to_string()
    }
}

