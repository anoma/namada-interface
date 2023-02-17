use std::str::FromStr;

use borsh::BorshDeserialize;
use masp_primitives::zip32::ExtendedFullViewingKey;
use namada::{
    ledger::wallet::{Alias, SdkWalletUtils, Store, StoredKeypair, Wallet},
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
        masp::ExtendedSpendingKey,
    },
};
use wasm_bindgen::JsError;

pub type WalletUtils = SdkWalletUtils<String>;

pub(crate) const STORAGE_PATH: &str = "";

pub fn encode(wallet: &Wallet<WalletUtils>) -> Vec<u8> {
    wallet.store().encode()
}

pub fn decode(data: Vec<u8>) -> Result<Wallet<WalletUtils>, JsError> {
    let store = Store::decode(data)?;
    let wallet = Wallet::new(STORAGE_PATH.to_owned(), store);
    Ok(wallet)
}

pub fn add_key(
    wallet: &mut Wallet<WalletUtils>,
    private_key: &str,
    password: Option<String>,
    alias: Option<String>,
) {
    let sk = key::ed25519::SecretKey::from_str(private_key)
        .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
        .unwrap();
    let sk = SecretKey::Ed25519(sk);
    let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
    let (keypair_to_store, _raw_keypair) = StoredKeypair::new(sk, password);
    let address = Address::Implicit(ImplicitAddress(pkh.clone()));
    let alias: Alias = alias.unwrap_or_else(|| pkh.clone().into()).into();

    if wallet
        .store_mut()
        .insert_keypair::<WalletUtils>(alias.clone(), keypair_to_store, pkh)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
    if wallet
        .store_mut()
        .insert_address::<WalletUtils>(alias.clone(), address)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}

pub fn add_spending_key(
    wallet: &mut Wallet<WalletUtils>,
    xsk: &[u8],
    password: Option<String>,
    alias: &str,
) {
    let xsk: masp_primitives::zip32::ExtendedSpendingKey =
        BorshDeserialize::try_from_slice(xsk).expect("XSK deserialization failed.");

    let xsk = ExtendedSpendingKey::from(xsk);
    let viewkey = ExtendedFullViewingKey::from(&xsk.into()).into();
    let (spendkey_to_store, _raw_spendkey) = StoredKeypair::new(xsk, password);
    let alias = Alias::from(alias);

    if wallet
        .store_mut()
        .insert_spending_key::<WalletUtils>(alias.clone(), spendkey_to_store, viewkey)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}
