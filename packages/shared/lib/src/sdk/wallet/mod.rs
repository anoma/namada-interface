use namada::{
    masp::ExtendedSpendingKey,
    sdk::wallet::{alias::Alias, Wallet, WalletIo},
};
use std::str::FromStr;

#[cfg(feature = "web")]
mod wallet_web;

#[cfg(feature = "web")]
pub use wallet_web::BrowserWalletUtils as JSWalletUtils;

#[cfg(feature = "nodejs")]
mod wallet_node;

#[cfg(feature = "nodejs")]
pub use wallet_node::NodeWalletUtils as JSWalletUtils;

/// Adds spending key to the wallet.
/// It's needed because we create addresses without using the Sdk.
/// Panics if inserting spending key is impossible.
///
/// # Arguments
///
/// * `wallet` - Instance of a wallet struct.
/// * `xsk` - String representing serialized ExtendedSpendingKey.
/// * `alias` - Spending key alias.
pub fn add_spending_key<U: WalletIo>(wallet: &mut Wallet<U>, xsk: &str, alias: &str) {
    let xsk = ExtendedSpendingKey::from_str(xsk).expect("XSK deserialization failed.");
    let alias = Alias::from(alias);

    // xsk is decrypted outside of this wallet instance, so we specify None below
    if wallet
        .store_mut()
        .insert_spending_key::<U>(alias.clone(), xsk, None, None, true)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}


//TODO: add more wallet functions
