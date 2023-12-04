use std::str::FromStr;

use namada::{
    namada_sdk::wallet::{alias::Alias, Wallet, WalletIo, WalletStorage},
    types::masp::ExtendedSpendingKey,
};
use rand::rngs::OsRng;

#[derive(Clone)]
pub struct BrowserWalletUtils {}

impl WalletIo for BrowserWalletUtils {
    type Rng = OsRng;
}

//TODO: check if we need to impl those
impl WalletStorage for BrowserWalletUtils {
    fn save<U>(
        &self,
        _wallet: &Wallet<U>,
    ) -> Result<(), namada::namada_sdk::wallet::LoadStoreError> {
        todo!()
    }

    fn load<U>(
        &self,
        _wallet: &mut Wallet<U>,
    ) -> Result<(), namada::namada_sdk::wallet::LoadStoreError> {
        todo!()
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
    let password = password.map(|pwd| zeroize::Zeroizing::new(pwd));
    let alias = Alias::from(alias);

    if wallet
        .store_mut()
        .insert_spending_key::<BrowserWalletUtils>(alias.clone(), xsk, password, false)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}
