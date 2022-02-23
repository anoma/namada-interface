use crate::types::keypair::Keypair;
use anoma::types::{
    address::{Address as AnomaAddress,ImplicitAddress},
    key::ed25519::{PublicKey,PublicKeyHash},
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Address(pub(crate) AnomaAddress);

#[wasm_bindgen]
impl Address {
    #[wasm_bindgen(getter)]
    pub fn encoded(&self) -> String {
        self.0.encode()
    }

    #[wasm_bindgen]
    pub fn from_keypair(keypair: &Keypair) -> Self {
        let public_key = PublicKey::from(keypair.0.public.clone());
        let pkh = PublicKeyHash::from(public_key);
        let implicit_address = ImplicitAddress::Ed25519(pkh);
        let address = AnomaAddress::Implicit(implicit_address);
        Address(address)
    }

    #[wasm_bindgen]
    pub fn decode(encoded: String) -> Result<Address, JsValue> {
        AnomaAddress::decode(encoded)
            .map(Address)
            .map_err(|error| JsValue::from(error.to_string()))
    }
}
