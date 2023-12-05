use namada::namada_sdk::wallet::{Wallet, WalletIo, WalletStorage};
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
