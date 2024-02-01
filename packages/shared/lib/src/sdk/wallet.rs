use namada::{
    sdk::wallet::{alias::Alias, Wallet, WalletIo, WalletStorage},
    types::masp::ExtendedSpendingKey,
};
use rand::rngs::OsRng;
use std::str::FromStr;

#[derive(Clone)]
pub struct BrowserWalletUtils {}

impl WalletIo for BrowserWalletUtils {
    type Rng = OsRng;
}

//TODO: check if we need to impl those
impl WalletStorage for BrowserWalletUtils {
    fn save<U>(&self, _wallet: &Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        todo!()
    }

    fn load<U>(&self, _wallet: &mut Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
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
/// * `alias` - Spending key alias.
pub fn add_spending_key(wallet: &mut Wallet<BrowserWalletUtils>, xsk: &str, alias: &str) {
    let xsk = ExtendedSpendingKey::from_str(xsk).expect("XSK deserialization failed.");
    let alias = Alias::from(alias);

    // xsk is decrypted outside of this wallet instance, so we specify None below
    if wallet
        .store_mut()
        .insert_spending_key::<BrowserWalletUtils>(alias.clone(), xsk, None, None, false)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}
