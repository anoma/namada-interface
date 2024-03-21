use std::str::FromStr;

use namada::{
    masp::ExtendedSpendingKey,
    sdk::wallet::{alias::Alias, Wallet, WalletIo, WalletStorage},
};
use rand::rngs::OsRng;

#[derive(Clone)]
pub struct BrowserWalletUtils {
    #[borsh(skip)]
    name: String,
}

impl BrowserWalletUtils {

    pub fn new_utils(db_name: &str) -> Self {
        Self { name }
    }
}

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
