use serde::{Serialize, Deserialize};
use bip0039::{Mnemonic, Seed, Language};
use bip32::{Prefix, XPrv};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Wallet {
    root_key: String,
    seed: Vec<u8>,
    phrase: String,
    password: String,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Bip32Keys {
    xpriv: String,
    xpub: String,
    private_key: Vec<u8>,
    public_key: Vec<u8>,
}

#[wasm_bindgen]
impl Wallet {
    pub fn new(
        phrase: String,
        password: String) -> Wallet {

        let mnemonic = Mnemonic::from_phrase(&phrase, Language::English).unwrap();
        let seed = Seed::new(&mnemonic, &password);
        let seed: &[u8] = seed.as_bytes();

        // BIP32 Root Key
        let root_xprv = XPrv::new(&seed);
        let root_xprv_str = root_xprv.unwrap().to_string(Prefix::XPRV).to_string();

        Wallet {
            phrase,
            password,
            seed: seed.to_vec(),
            root_key: root_xprv_str,
        }
    }

    /// Derive a child account
    pub fn derive(
        &self,
        path: String,
        child: String) -> Result<JsValue, JsValue> {

        let path = format!("{}/{}", &path, &child);
        let child_account = &self.make_extended_keys(path);

        Ok(JsValue::from_serde(&child_account).unwrap())
    }

    /// Derive extended keys from a seed and a path
    pub fn make_extended_keys(&self, path: String) -> Bip32Keys {
        let seed: &[u8] = &self.seed;
        // BIP32 Extended Private Key
        let xprv = XPrv::derive_from_path(&seed, &path.parse().unwrap()).unwrap();
        let xprv_str = xprv.to_string(Prefix::XPRV).to_string();

        // BIP32 Extended Public Key
        let xpub = xprv.public_key();
        let xpub_str = xpub.to_string(Prefix::XPUB);

        Bip32Keys {
            xpriv: xprv_str,
            xpub: xpub_str,
            private_key: xprv.private_key().to_bytes().to_vec(),
            public_key: xpub.public_key().to_bytes().to_vec()
        }
    }

    /// Get serialized Wallet
    pub fn serialize(&self) -> Result<JsValue, JsValue> {
        Ok(JsValue::from_serde(&self).expect("Wallet should serialize correctly"))
    }

    /// Serializable extended keys
    pub fn extended_keys(&self, path: String) -> Result<JsValue, JsValue> {
        let keys = &self.make_extended_keys(path);
        Ok(JsValue::from_serde(&keys).unwrap())
    }
}
