use namada::sdk::{
    borsh::{BorshDeserialize, BorshSerialize},
    wallet::{Wallet, WalletIo, WalletStorage},
};
use rand::rngs::OsRng;

#[derive(Debug, BorshSerialize, BorshDeserialize, Clone)]
#[borsh(crate = "namada::core::borsh")]
pub struct BrowserWalletUtils {
    #[borsh(skip)]
    _name: String,
}

impl BrowserWalletUtils {
    pub fn new_utils(name: &str) -> Self {
        Self {
            _name: name.to_string(),
        }
    }
}

impl WalletIo for BrowserWalletUtils {
    type Rng = OsRng;
}

//TODO: We can't implement it until namada changes trait to be async
impl WalletStorage for BrowserWalletUtils {
    fn save<U>(&self, _wallet: &Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        todo!()
    }

    fn load<U>(&self, _wallet: &mut Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        todo!()
    }
}
