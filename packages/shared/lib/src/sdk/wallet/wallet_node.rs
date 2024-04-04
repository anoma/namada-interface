use std::path::PathBuf;

use namada::sdk::{
    borsh::{BorshDeserialize, BorshSerialize},
    wallet::{LoadStoreError, Store, Wallet, WalletIo, WalletStorage},
};
use rand::rngs::OsRng;
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use crate::utils::to_bytes;

#[derive(Debug, BorshSerialize, BorshDeserialize, Clone)]
#[borsh(crate = "namada::core::borsh")]
pub struct NodeWalletUtils {
    #[borsh(skip)]
    store_dir: PathBuf,
}

impl NodeWalletUtils {
    pub fn new_utils(store_dir: &str) -> Self {
        let store_dir = PathBuf::from(store_dir);
        Self { store_dir }
    }
}

impl WalletIo for NodeWalletUtils {
    type Rng = OsRng;
}

pub trait NodeWalletStorage: Clone {
    fn store_dir(&self) -> &PathBuf;
}

impl NodeWalletStorage for NodeWalletUtils {
    fn store_dir(&self) -> &PathBuf {
        &self.store_dir
    }
}

const FILE_NAME: &str = "wallet.toml";

impl WalletStorage for NodeWalletUtils {
    fn save<U>(&self, wallet: &Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        let data = wallet.store().encode();

        let wallet_path = self.store_dir().join(FILE_NAME);
        // Make sure the dir exists
        let wallet_dir = wallet_path.parent().unwrap();
        let uint8_array = js_sys::Uint8Array::from(&data[..]);

        write_file_sync(
            JsValue::from_str(wallet_dir.to_str().unwrap()),
            uint8_array.into(),
        )
        .unwrap();

        Ok(())
    }

    fn load<U>(&self, wallet: &mut Wallet<U>) -> Result<(), namada::sdk::wallet::LoadStoreError> {
        let wallet_file = self.store_dir().join(FILE_NAME);

        let stored_data: Vec<u8> =
            to_bytes(read_file_sync(JsValue::from_str(wallet_file.to_str().unwrap())).unwrap());

        let store = wallet.store_mut();

        *store = Store::decode(stored_data).map_err(LoadStoreError::Decode)?;

        Ok(())
    }
}

#[wasm_bindgen(module = "/src/sdk/masp/masp_node.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "writeFileSync")]
    fn write_file_sync(path: JsValue, content: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "readFileSync")]
    fn read_file_sync(path: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "renameSync")]
    fn renameSync(pathA: JsValue, pathB: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "unlinkSync")]
    fn unlinkSync(path: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "existsSync")]
    fn exists_sync(path: JsValue) -> Result<JsValue, JsValue>;
}
