use std::str::FromStr;

use namada::{
    ledger::wallet::{Alias, ConfirmationResponse, Store, StoredKeypair, WalletUtils},
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
    },
};
use wasm_bindgen::prelude::*;

pub struct WebWallet {}

impl WalletUtils for WebWallet {
    type Storage = String;

    fn read_and_confirm_pwd(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }

    fn read_password(_prompt_msg: &str) -> String {
        todo!()
    }

    fn read_alias(_prompt_msg: &str) -> String {
        todo!()
    }

    fn show_overwrite_confirmation(_alias: &Alias, _alias_for: &str) -> ConfirmationResponse {
        ConfirmationResponse::Replace
    }

    fn new_password_prompt(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }
}

#[wasm_bindgen]
pub struct StoreWrapper {
    store: Store,
}

impl StoreWrapper {
    pub fn new() -> Result<StoreWrapper, String> {
        Ok(StoreWrapper {
            store: Store::default(),
        })
    }

    pub fn add_keys(&mut self, private_key: &str, alias: &str) -> (Alias, SecretKey) {
        let sk = key::ed25519::SecretKey::from_str(private_key)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
            .expect("FIX ME");
        let sk = SecretKey::Ed25519(sk);

        let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
        // What with pw?
        let (keypair_to_store, raw_keypair) = StoredKeypair::new(sk, None);
        let address = Address::Implicit(ImplicitAddress(pkh.clone()));
        let alias: Alias = alias.into();
        if self
            .store
            .insert_keypair::<WebWallet>(alias.clone(), keypair_to_store, pkh)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
        if self
            .store
            .insert_address::<WebWallet>(alias.clone(), address)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
        (alias, raw_keypair)
    }
}
