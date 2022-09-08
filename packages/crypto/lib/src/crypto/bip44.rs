use bip32::{Prefix, XPrv};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Bip44 {
    seed: Vec<u8>,
}

#[wasm_bindgen]
pub struct DerivedKeys {
    secret: Vec<u8>,
    public: Vec<u8>,
}

#[wasm_bindgen]
impl DerivedKeys {
    //TODO: Implement encoding
    pub fn secret(&self) -> Vec<u8> {
        self.secret.clone()
    }

    pub fn public(&self) -> Vec<u8> {
        self.public.clone()
    }
}

#[wasm_bindgen]
pub struct ExtendedKeys {
    xprv: Vec<u8>,
    xpub: Vec<u8>,
}

#[wasm_bindgen]
impl ExtendedKeys {
    pub fn new (seed: Vec<u8>, path: Option<String>) -> Result<ExtendedKeys, String> {
        let seed: &[u8] = &seed;

        let xprv = match path {
            Some(path) => XPrv::derive_from_path(
                &seed,
                &path.parse().expect("Could not parse path",
            )),
            None => XPrv::new(seed),
        }.expect("Extended private key could not be derived");

        // BIP32 Extended Private Key
        let xprv_str = xprv.to_string(Prefix::XPRV).to_string();
        let xprv_bytes = xprv_str.as_bytes();

        // BIP32 Extended Public Key
        let xpub = xprv.public_key();
        let xpub_str = xpub.to_string(Prefix::XPUB);
        let xpub_bytes = xpub_str.as_bytes();

        Ok(ExtendedKeys {
            xprv: Vec::from(xprv_bytes),
            xpub: Vec::from(xpub_bytes),
        })
    }

    pub fn get_private (&self) -> Vec<u8> {
        self.xprv.clone()
    }

    pub fn get_public (&self) -> Vec<u8> {
        self.xpub.clone()
    }
}

#[wasm_bindgen]
impl Bip44 {
    pub fn new(seed: Vec<u8>) -> Bip44 {
        Bip44 {
            seed,
        }
    }

    /// Get private key from seed
    pub fn get_private_key(&self) -> Result<Vec<u8>, String> {
        let seed = &self.seed;
        let xprv = match XPrv::new(seed) {
            Ok(xprv) => xprv,
            Err(error) => return Err(error.to_string())
        };

        Ok(Vec::from(xprv.to_string(Prefix::XPRV).as_bytes()))
    }

    /// Derive account from a seed and a path
    pub fn derive(&self, path: String) -> Result<DerivedKeys, String> {
        // BIP32 Extended Private Key
        let xprv = match XPrv::derive_from_path(&self.seed, &path.parse().unwrap()) {
            Ok(xprv) => xprv,
            Err(error) => return Err(format!("Could not derive from path {:?}", error))
        };
         let prv_bytes: &[u8] = &xprv.private_key().to_bytes();

        // ed25519 keypair
        let secret = ed25519_dalek::SecretKey::from_bytes(prv_bytes)
            .expect("Could not create secret from bytes");
        let public = ed25519_dalek::PublicKey::from(&secret);

        Ok(DerivedKeys {
            secret: secret.to_bytes().to_vec(),
            public: public.to_bytes().to_vec(),
        })
    }

    /// Get extended keys from path
    pub fn get_extended_keys(&self, path: Option<String>) -> Result<ExtendedKeys, String> {
        let seed = self.seed.clone();
        let extended_keys = match ExtendedKeys::new(seed, path) {
            Ok(extended_keys) => extended_keys,
            Err(error) => return Err(error)
        };

        Ok(extended_keys)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::mnemonic::Mnemonic;

    #[test]
    fn can_derive_keys_from_path() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic = Mnemonic::from_phrase(phrase.into());
        let seed = mnemonic.to_seed(None).unwrap();
        let bip44: Bip44 = Bip44::new(seed);
        let path = "m/44'/0'/0'/0'";

        let keys = bip44.derive(String::from(path)).expect("Should derive keys from a path");

        assert_eq!(keys.secret.len(), 32);
        assert_eq!(keys.public.len(), 32);
    }
}
