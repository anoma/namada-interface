//! PaymentAddress - Provide wasm_bindgen bindings for shielded addresses
//! See @anoma/crypto for zip32 HD wallet functionality.
use std::str::FromStr;
use namada::types::masp;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PaymentAddress(pub (crate) masp::PaymentAddress);

#[wasm_bindgen]
impl PaymentAddress {
    /// TODO: Implement for Namada
    #[wasm_bindgen(constructor)]
    pub fn new(secret: &str) -> Result<PaymentAddress, String> {
        let address = masp::PaymentAddress::from_str(secret)
            .map_err(|err| err.to_string())?;
        Ok(PaymentAddress(address))
    }

    pub fn address(&self) -> String {
        self.0.to_string()
    }
}
