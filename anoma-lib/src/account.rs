use crate::types::{
    address::Address,
    transaction::Transaction,
    keypair::Keypair,
};
use anoma::types::{
    transaction::InitAccount,
    key::ed25519::PublicKey,
};
use borsh::BorshSerialize;
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

#[derive(Serialize,Deserialize)]
pub struct Account(pub Transaction);

#[derive(Serialize, Deserialize)]
pub struct ChildAccount {
    secret: [u8; 32],
    address: [u8; 20],
    public_key: Vec<u8>,
    xpriv: [u8; 32],
}

#[wasm_bindgen]
impl Account {
    /// Initialize an account on the Ledger
    pub fn init(
        serialized_keypair: JsValue,
        token: String,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
        vp_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let token = Address::decode(token)?;
        let tx_code: Vec<u8> = tx_code.to_vec();
        let vp_code: Vec<u8> = vp_code.to_vec();
        let keypair = &Keypair::deserialize(serialized_keypair.clone())
            .expect("Keypair could not be deserialized");
        let public_key = PublicKey::from(keypair.0.public.clone());

        let data = InitAccount {
            public_key,
            vp_code: vp_code.clone(),
        };
        let data = data.try_to_vec().expect("Encoding tx data shouldn't fail");

        Ok(JsValue::from_serde(&Account(Transaction::new(
            serialized_keypair,
            token,
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
            data
        ).unwrap())).unwrap())
    }

    pub fn seed_from_mnemonic(phrase: String, password: String) -> JsValue {
        let mnemonic = Mnemonic::from_phrase(phrase, Language::English).unwrap();
        let seed = Seed::new(&mnemonic, &password);
        // Return the seed in hexadecimal format
        JsValue::from(format!("{:X}", seed))
    }

    /// Derive a child account
    pub fn derive(
        phrase: String,
        password: String,
        path: String,
        child: String) -> Result<JsValue, JsValue> {
        // Validates mnemonic phrase
        let mnemonic = Mnemonic::from_phrase(phrase, Language::English).unwrap();
        let seed = Seed::new(&mnemonic, &password);
        let seed: &[u8] = seed.as_bytes();

        let derivation_path: DerivationPath = IntoDerivationPath::into(&*path)
            .expect("Should create a DerivationPath type");

        web_sys::console::log_1(&JsValue::from(&format!("{:?}", derivation_path)));

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
            xpriv: ext.secret()
        };

        Ok(JsValue::from_serde(&child_account).unwrap())
    }
}
