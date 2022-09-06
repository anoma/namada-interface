use serde::{Serialize, Deserialize};
use bip32::{Prefix, XPrv};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Bip44 {
    root_key: String,
    seed: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct DerivedAccount {
    private_key: Vec<u8>,
    public_key: Vec<u8>,
    secret: Vec<u8>,
    public: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct ExtendedKeys {
    xpriv: String,
    xpub: String,
}

#[wasm_bindgen]
impl Bip44 {
    pub fn new(seed: Vec<u8>) -> Result<Bip44, JsValue> {
        let seed: &[u8] = &seed;

        // BIP32 Root Key
        let root_xprv = XPrv::new(&seed).expect("Could not create extended private key from seed");
        let root_xprv_str = root_xprv.to_string(Prefix::XPRV).to_string();

        Ok(Bip44 {
            root_key: root_xprv_str,
            seed: seed.to_vec(),
        })
    }

    /// Derive account from a seed and a path
    pub fn derive(&self, path: String) -> Result<DerivedAccount, String> {
        let seed: &[u8] = &self.seed;

        // BIP32 Extended Private Key
        let xprv = match XPrv::derive_from_path(&seed, &path.parse().unwrap()) {
            Ok(xprv) => xprv,
            Err(error) => return Err(error.to_string())
        };

        // BIP32 Extended Public Key
        let xpub = xprv.public_key();

        // ed25519 keypair
        let prv_bytes: &[u8] = &xprv.private_key().clone().to_bytes();
        let secret = ed25519_dalek::SecretKey::from_bytes(prv_bytes)
            .expect("Could not create secret from bytes");
        let public = ed25519_dalek::PublicKey::from(&secret);

        Ok(DerivedAccount {
            secret: xprv.private_key().to_bytes().to_vec(),
            public: xpub.public_key().to_bytes().to_vec(),
            private_key: secret.to_bytes().to_vec(),
            public_key: public.to_bytes().to_vec(),
        })
    }

    /// Get extended keys from path
    pub fn get_extended_keys(&self, path: String) -> Result<ExtendedKeys, String> {
        let seed: &[u8] = &self.seed;

        // BIP32 Extended Private Key
        let xprv = match XPrv::derive_from_path(&seed, &path.parse().unwrap()) {
            Ok(xprv) => xprv,
            Err(error) => return Err(error.to_string())
        };
        let xprv_str = xprv.to_string(Prefix::XPRV).to_string();

        // BIP32 Extended Public Key
        let xpub = xprv.public_key();
        let xpub_str = xpub.to_string(Prefix::XPUB);

        Ok(ExtendedKeys {
            xpriv: xprv_str,
            xpub: xpub_str,
        })
    }

    /// Get serialized Wallet
    pub fn serialize(&self) -> Result<JsValue, JsValue> {
        Ok(JsValue::from_serde(&self).expect("Wallet could not be serialized"))
    }

    /// Get serialized extended keys
    pub fn extended_keys(&self, path: String) -> Result<JsValue, JsValue> {
        let keys = &self.get_extended_keys(path);
        Ok(JsValue::from_serde(&keys).expect("Extended keys could not be serialized"))
    }

    /// Get serialized derived account
    pub fn account(&self, path: String) -> Result<JsValue, JsValue> {
        let keys = &self.derive(path);
        Ok(JsValue::from_serde(&keys).expect("Derived account could not be serialized"))
    }
}
