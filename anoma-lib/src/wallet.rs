use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use std::str::FromStr;

use bip0039::{Mnemonic, Seed, Language};
use ethsign::SecretKey;
use tiny_hderive::{
    bip32::ExtendedPrivKey,
    bip44::{ChildNumber, DerivationPath, IntoDerivationPath},
};

extern crate base64;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Wallet {
    xpriv: [u8; 32],
    seed: Vec<u8>,
    phrase: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
pub struct ChildAccount {
    secret: [u8; 32],
    address: [u8; 20],
    public_key: Vec<u8>,
}

#[wasm_bindgen]
impl Wallet {
    pub fn new(
        phrase: String,
        password: String,
        path: String) -> Wallet {

        let mnemonic = Mnemonic::from_phrase(&phrase, Language::English).unwrap();
        let seed = Seed::new(&mnemonic, &password);

        let derivation_path: DerivationPath = IntoDerivationPath::into(&*path)
            .expect("Should create a DerivationPath type");

        let seed: &[u8] = seed.as_bytes();
        let ext = ExtendedPrivKey::derive(seed, derivation_path)
            .expect("Should be able to derive Extended Private Key");

        Wallet {
            phrase,
            password,
            seed: seed.to_vec(),
            xpriv: ext.secret()
        }
    }

    /// Get serialized Wallet
    #[wasm_bindgen]
    pub fn serialize(&self) -> Result<JsValue, JsValue> {
        Ok(JsValue::from_serde(&Wallet {
            xpriv: self.xpriv,
            seed: self.seed.clone(),
            phrase: self.phrase.clone(),
            password: self.password.clone()
        }).unwrap())
    }

    /// Derive a child account
    #[wasm_bindgen]
    pub fn derive(
        &self,
        path: String,
        child: String) -> Result<JsValue, JsValue> {
        // Validates mnemonic phrase

        let derivation_path: DerivationPath = IntoDerivationPath::into(&*path)
            .expect("Should create a DerivationPath type");

        web_sys::console::log_1(&JsValue::from(&format!("{:?}", derivation_path)));

        let seed: &[u8] = &self.seed;
        let ext = ExtendedPrivKey::derive(seed, derivation_path).unwrap();
        let child_ext = ext.child(ChildNumber::from_str(&child).unwrap()).unwrap();

        let secret_key = SecretKey::from_raw(&child_ext.secret()).unwrap();
        let public_key = secret_key.public();
        let address = public_key.address();
        let public = &public_key.bytes();

        let child_account = ChildAccount {
            secret: child_ext.secret(),
            address: *address,
            public_key: public.to_vec(),
        };

        Ok(JsValue::from_serde(&child_account).unwrap())
    }
}
