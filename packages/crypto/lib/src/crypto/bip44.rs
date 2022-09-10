use bip32::{Prefix, XPrv};
use std::convert::From;
use std::fmt::{self, Display};
use std::string::ToString;
use thiserror::Error;

use wasm_bindgen::prelude::*;


#[allow(missing_docs)]
#[derive(Debug, Error)]
pub enum Bip44Error {
    #[error("Unable to parse path")]
    PathError,
    #[error("Unable to derive keys from path")]
    DerivationError,
    #[error("Could not create secret key from bytes")]
    SecretKeyError,
    #[error("Invalid seed length")]
    InvalidSeed,
}

#[wasm_bindgen]
pub struct Bip44 {
    seed: [u8; 64],
}

#[wasm_bindgen]
pub struct Key {
    bytes: [u8; 32],
}

/// A 32 byte ed25519 key
impl Key {
    pub fn len(&self) -> i32 {
       self.bytes.len() as i32
    }

    pub fn to_bytes(&self) -> [u8; 32] {
        self.bytes
    }

    pub fn is_empty(&self) -> bool {
        self.bytes.len() > 0
    }
}

impl Display for Key {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let as_string = self.bytes
            .iter()
            .map(|&c| c as char).collect::<String>();

        write!(f, "{}", as_string)
    }
}

impl From<[u8; 32]> for Key {
    fn from(bytes: [u8; 32]) -> Key {
        Key {
            bytes,
        }
    }
}

trait Encodings {
    fn to_hex(&self) -> String;
    fn to_base64(&self) -> String;
}

impl Encodings for Key {
    fn to_hex(&self) -> String {
        hex::encode(self.to_string())
    }

    fn to_base64(&self) -> String {
        base64::encode(self.to_string())
    }
}

#[wasm_bindgen]
pub struct DerivedKeys {
    private: Key,
    public: Key,
}

#[wasm_bindgen]
impl DerivedKeys {
    pub fn private(&self) -> Vec<u8> {
        Vec::from(self.private.to_bytes())
    }

    pub fn public(&self) -> Vec<u8> {
        Vec::from(self.public.to_bytes())
    }
}

/// Root or derived extended keys
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
            Some(path) => {
                let path = &path.parse().map_err(|_| Bip44Error::PathError);
                let derivation_path = match path {
                    Ok(path) => path,
                    Err(error) => return Err(error.to_string()),
                };
                XPrv::derive_from_path(&seed, derivation_path)
            },
            None => XPrv::new(seed),
        };

        let xprv = match xprv {
            Ok(xprv) => xprv,
            Err(_) => return Err(Bip44Error::DerivationError.to_string()),
        };

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

    pub fn private (&self) -> Vec<u8> {
        self.xprv.clone()
    }

    pub fn public (&self) -> Vec<u8> {
        self.xpub.clone()
    }
}

fn validate_seed(seed: Vec<u8>) -> Result<[u8; 64], String> {
    let seed: [u8; 64] = seed.try_into()
        .unwrap_or_else(|v: Vec<u8>| panic!("Expected a Vec of length {} but it was {}", 64, v.len()));
    Ok(seed)
}

#[wasm_bindgen]
impl Bip44 {
    pub fn new(seed: Vec<u8>) -> Result<Bip44, String> {
        let seed = match validate_seed(seed) {
            Ok(seed) => seed,
            Err(_) => return Err(Bip44Error::InvalidSeed.to_string()),
        };

        Ok(Bip44 {
            seed,
        })
    }

    /// Get private key from seed
    pub fn get_private_key(&self) -> Result<Vec<u8>, String> {
        let seed = &self.seed;
        let xprv = match XPrv::new(seed) {
            Ok(xprv) => xprv,
            Err(_) => return Err(Bip44Error::DerivationError.to_string()),
        };

        Ok(Vec::from(xprv.to_string(Prefix::XPRV).as_bytes()))
    }

    /// Derive account from a seed and a path
    pub fn derive(&self, path: String) -> Result<DerivedKeys, String> {
        // BIP32 Extended Private Key
        let xprv = match XPrv::derive_from_path(&self.seed, &path.parse().unwrap()) {
            Ok(xprv) => xprv,
            Err(_) => return Err(Bip44Error::DerivationError.to_string()),
        };
        let prv_bytes: &[u8] = &xprv.private_key().to_bytes();

        // ed25519 keypair
        let secret = ed25519_dalek::SecretKey::from_bytes(prv_bytes)
            .map_err(|_| Bip44Error::SecretKeyError);

        let secret_key = match secret {
            Ok(secret_key) => secret_key,
            Err(error) => return Err(error.to_string()),
        };

        let public = ed25519_dalek::PublicKey::from(&secret_key);

        Ok(DerivedKeys {
            private: Key::from(secret_key.to_bytes()),
            public: Key::from(public.to_bytes()),
        })
    }

    /// Get extended keys from path
    pub fn get_extended_keys(&self, path: Option<String>) -> Result<ExtendedKeys, String> {
        let seed: &[u8] = &self.seed;
        let extended_keys = match ExtendedKeys::new(Vec::from(seed), path) {
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
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic = Mnemonic::from_phrase(phrase.into());
        let seed = mnemonic.to_seed(None).unwrap();
        let bip44: Bip44 = Bip44::new(seed).unwrap();
        let path = "m/44'/0'/0'/0'";

        let keys = bip44.derive(String::from(path)).expect("Should derive keys from a path");

        assert_eq!(keys.private.len(), 32);
        assert_eq!(keys.public.len(), 32);

        let secret_b64 = keys.private.to_base64();
        assert_eq!(secret_b64, "VsKNwrDDlcOPwockKcOww7TDssKFDzY3b2rCscK1w6crNVzDmMOxbjklwqnCo0sg");

        let secret_hex = keys.private.to_hex();
        assert_eq!(secret_hex, "56c28dc2b0c395c38fc2872429c3b0c3b4c3b2c2850f36376f6ac2b1c2b5c3a72b355cc398c3b16e3925c2a9c2a34b20");

        let public_b64 = keys.public.to_base64();
        assert_eq!(public_b64, "w5QFw7MvFsOjJsKeSFMYK2fDtlhKPSrCsMKkTzTCusOpw4N+csOnfsONwobDkg==");

        let public_hex = keys.public.to_hex();
        assert_eq!(public_hex, "c39405c3b32f16c3a326c29e4853182b67c3b6584a3d2ac2b0c2a44f34c2bac3a9c3837e72c3a77ec38dc286c392");
    }
}
