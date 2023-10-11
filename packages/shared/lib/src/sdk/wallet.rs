use std::str::FromStr;

use masp_primitives::zip32::ExtendedFullViewingKey;
use namada::{
    sdk::wallet::{alias::Alias, Store, StoredKeypair, Wallet, WalletIo, WalletStorage},
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
        masp::ExtendedSpendingKey,
    },
};
use rand::rngs::OsRng;
use wasm_bindgen::JsError;

#[derive(Clone)]
pub struct BrowserWalletUtils {}

impl WalletIo for BrowserWalletUtils {
    type Rng = OsRng;
}

impl WalletStorage for BrowserWalletUtils {
    fn save<U>(&self, wallet: &Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        todo!()
    }

    fn load<U>(&self, wallet: &mut Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        todo!()
    }
}

/// We get the data from the IndexedDB, that's why we don't need to specify the path.
pub(crate) const STORAGE_PATH: &str = "";

/// Encodes wallet data.
pub fn encode(wallet: &Wallet<BrowserWalletUtils>) -> Vec<u8> {
    wallet.store().encode()
}

/// Decodes wallet data and assings it in the Sdk.
/// Returns new Wallet instance if data can be deserialized.
///
/// # Arguments
///
/// * `data` - Serialized wallet data.
///
/// # Errors
///
/// Returns a JsError if the wallet data can't be deserialized.
pub fn decode(data: Vec<u8>) -> Result<Wallet<BrowserWalletUtils>, JsError> {
    let store = Store::decode(data)?;
    let wallet = Wallet::new(BrowserWalletUtils {}, Store::default());
    Ok(wallet)
}

/// Adds keypair and the address to the wallet.
/// It's needed because we create addresses without using the Sdk.
/// Panics if inserting keypair or address is impossible.
///
/// # Arguments
///
/// * `wallet` - Instance of a wallet struct.
/// * `private_key` - Private key to generate keypair from.
/// * `password` - Password to encrypt the keypair.
/// * `alias` - Optional address/keypair alias.
pub fn add_key(
    wallet: &mut Wallet<BrowserWalletUtils>,
    private_key: &str,
    password: Option<String>,
    alias: Option<String>,
) {
    let sk = key::ed25519::SecretKey::from_str(private_key)
        .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
        .unwrap();
    let sk = SecretKey::Ed25519(sk);
    let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
    let password = password.map(|pwd| zeroize::Zeroizing::new(pwd));
    let (keypair_to_store, _raw_keypair) = StoredKeypair::new(sk, password);
    let address = Address::Implicit(ImplicitAddress(pkh.clone()));
    let alias: Alias = alias.unwrap_or_else(|| pkh.clone().into()).into();

    if wallet
        .store_mut()
        .insert_keypair::<BrowserWalletUtils>(alias.clone(), keypair_to_store, pkh, false)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
    if wallet
        .store_mut()
        .insert_address::<BrowserWalletUtils>(alias.clone(), address, false)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}

/// Adds spending key to the wallet.
/// It's needed because we create addresses without using the Sdk.
/// Panics if inserting spending key is impossible.
///
/// # Arguments
///
/// * `wallet` - Instance of a wallet struct.
/// * `xsk` - String representing serialized ExtendedSpendingKey.
/// * `password` - Password to encrypt the spending key.
/// * `alias` - Spending key alias.
pub fn add_spending_key(
    wallet: &mut Wallet<BrowserWalletUtils>,
    xsk: &str,
    password: Option<String>,
    alias: &str,
) {
    let xsk = ExtendedSpendingKey::from_str(xsk).expect("XSK deserialization failed.");
    let viewkey = ExtendedFullViewingKey::from(&xsk.into()).into();
    let password = password.map(|pwd| zeroize::Zeroizing::new(pwd));
    let (spendkey_to_store, _raw_spendkey) = StoredKeypair::new(xsk, password);
    let alias = Alias::from(alias);

    if wallet
        .store_mut()
        .insert_spending_key::<BrowserWalletUtils>(alias.clone(), spendkey_to_store, viewkey, false)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}
