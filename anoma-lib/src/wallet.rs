use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use bip0039::{Mnemonic, Seed, Language};
use bip32::{self, Prefix, XPrv};

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Wallet {
    // xpriv: [u8; 32],
    xpriv: String,
    seed: Vec<u8>,
    phrase: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
pub struct ChildAccount {
    xpriv: String,
    xpub: String,
    signing_key: Vec<u8>,
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

        let root_xprv = XPrv::new(&seed);
        let root_xprv_str = root_xprv.unwrap().to_string(Prefix::XPRV).to_string();

        Wallet {
            phrase,
            password,
            seed: seed.to_vec(),
            xpriv: root_xprv_str,
        }
    }

    /// Get serialized Wallet
    #[wasm_bindgen]
    pub fn serialize(&self) -> Result<JsValue, JsValue> {
        Ok(JsValue::from_serde(&Wallet {
            xpriv: self.xpriv.clone(),
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

        // Child - Private
        // BIP32 Extended Private Key
        let child_xprv = XPrv::derive_from_path(&seed, &path.parse().unwrap()).unwrap();
        let child_xprv_str = child_xprv.to_string(Prefix::XPRV).to_string();

        // Child - Public
        // BIP32 Extended Public Key
        let child_xpub = child_xprv.public_key();
        let child_xpub_str = child_xpub.to_string(Prefix::XPUB);

        let child_account = ChildAccount {
            xpriv: child_xprv_str,
            xpub: child_xpub_str,
            signing_key: child_xprv.private_key().to_bytes().to_vec(),
            public_key: child_xpub.public_key().to_bytes().to_vec()
        };

        Ok(JsValue::from_serde(&child_account).unwrap())
    }
}
