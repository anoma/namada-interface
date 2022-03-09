use serde::{Serialize, Deserialize};
use bip0039::{Mnemonic, Seed, Language};
use bip32::{self, Prefix, XPrv};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Wallet {
    root_key: String,
    xpriv: String,
    xpub: String,
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
        password: String,
        path: String) -> Wallet {

        let mnemonic = Mnemonic::from_phrase(&phrase, Language::English).unwrap();
        let seed = Seed::new(&mnemonic, &password);
        let seed: &[u8] = seed.as_bytes();

        // BIP32 Root Key
        let root_xprv = XPrv::new(&seed);
        let root_xprv_str = root_xprv.unwrap().to_string(Prefix::XPRV).to_string();

        // BIP32 Extended Keys (Private/Public)
        let keys = Wallet::make_extended_keys(seed, path);

        Wallet {
            phrase,
            password,
            seed: seed.to_vec(),
            root_key: root_xprv_str,
            xpriv: keys.xpriv,
            xpub: keys.xpub,
        }
    }

    /// Get serialized Wallet
    #[wasm_bindgen]
    pub fn serialize(&self) -> Result<JsValue, JsValue> {
        Ok(JsValue::from_serde(&Wallet {
            root_key: self.root_key.clone(),
            xpriv: self.xpriv.clone(),
            xpub: self.xpub.clone(),
            seed: self.seed.clone(),
            phrase: self.phrase.clone(),
            password: self.password.clone()
        }).unwrap())
    }

    /// Derive a child account
    #[wasm_bindgen]
    pub fn derive(
        &self,
        path: String,
        child: String) -> Result<JsValue, JsValue> {

        let seed: &[u8] = &self.seed;
        let path = format!("{}/{}", &path, &child);
        let child_account = Wallet::make_extended_keys(seed, path);

        Ok(JsValue::from_serde(&child_account).unwrap())
    }

    /// Derive extended keys from a seed and a path
    pub fn make_extended_keys(seed: &[u8], path: String) -> Bip32Keys {
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
}
