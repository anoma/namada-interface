use namada::{
    key::common::SecretKey,
    masp::{ExtendedSpendingKey, ExtendedViewingKey, PaymentAddress},
    sdk::{
        masp_primitives::zip32::ExtendedFullViewingKey,
        wallet::{alias::Alias, Wallet, WalletIo},
    },
};
use std::str::FromStr;
use zeroize::Zeroizing;

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
pub fn add_spending_key<U: WalletIo>(wallet: &mut Wallet<U>, xsk: String, alias: String) {
    let xsk = ExtendedSpendingKey::from_str(&xsk).expect("XSK deserialization failed.");
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

pub fn add_viewing_key<U: WalletIo>(wallet: &mut Wallet<U>, xvk: String, alias: String) {
    let xvk = ExtendedViewingKey::from_str(&xvk).expect("XVK deserialization failed.");
    let alias = Alias::from(alias);

    if wallet
        .store_mut()
        .insert_viewing_key::<U>(alias.clone(), xvk, true)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}

pub fn add_payment_address<U: WalletIo>(wallet: &mut Wallet<U>, pa: String, alias: String) {
    let pa = PaymentAddress::from_str(&pa).expect("Payment address deserialization failed.");
    let alias = Alias::from(alias);

    if wallet
        .store_mut()
        .insert_payment_addr::<U>(alias.clone(), pa, true)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}

pub fn add_default_payment_address<U: WalletIo>(
    wallet: &mut Wallet<U>,
    xvk: String,
    alias: String,
) {
    let xfvk: ExtendedFullViewingKey = ExtendedViewingKey::from_str(&xvk)
        .expect("XVK deserialization failed.")
        .into();
    let alias = Alias::from(alias);
    let pa: PaymentAddress = xfvk.default_address().1.into();

    if wallet
        .store_mut()
        .insert_payment_addr::<U>(alias.clone(), pa, true)
        .is_none()
    {
        panic!("Action cancelled, no changes persisted.");
    }
}

pub fn add_keypair<U: WalletIo>(
    wallet: &mut Wallet<U>,
    secret_key: String,
    alias: String,
    password: Option<String>,
) {
    let alias = Alias::from(alias);
    let secret_key = SecretKey::from_str(&secret_key).expect("SecretKey deserialization failed.");
    let password = password.map(Zeroizing::new);
    wallet
        .store_mut()
        .insert_keypair::<U>(alias.clone(), secret_key, password, None, None, true);
}
