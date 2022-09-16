use bip32::{Prefix, XPrv};
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
    #[error("Invalid key size")]
    InvalidKeySize,
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
#[wasm_bindgen]
impl Key {
    pub fn new(bytes: Vec<u8>) -> Result<Key, String> {
        let bytes: &[u8] = &bytes;
        let bytes: &[u8; 32] = bytes
            .try_into()
            .map_err(|_| Bip44Error::InvalidKeySize.to_string())?;

        Ok(Key {
            bytes: bytes.to_owned(),
        })
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        Vec::from(self.bytes)
    }

    pub fn to_hex(&self) -> String {
        let bytes: &[u8] = &self.bytes;
        hex::encode(&bytes)
    }

    pub fn to_base64(&self) -> String {
        let bytes: &[u8] = &self.bytes;
        base64::encode(&bytes)
    }
}

#[wasm_bindgen]
pub struct DerivedKeys {
    private: Key,
    public: Key,
}

#[wasm_bindgen]
impl DerivedKeys {
    pub fn private(&self) -> Key {
        Key { bytes: self.private.bytes }
    }

    pub fn public(&self) -> Key {
        Key { bytes: self.public.bytes }
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
    #[wasm_bindgen(constructor)]
    pub fn new (seed: Vec<u8>, path: Option<String>) -> Result<ExtendedKeys, String> {
        let seed: &[u8] = &seed;
        let xprv = match path {
            Some(path) => {
                let path = &path.parse().map_err(|_| Bip44Error::PathError);
                let derivation_path = match path {
                    Ok(derivation_path) => derivation_path,
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
    #[wasm_bindgen(constructor)]
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
            private: Key::new(Vec::from(secret_key.to_bytes()))
                     .expect("Creating Key from bytes should not fail"),
            public: Key::new(Vec::from(public.to_bytes()))
                    .expect("Creating Key from bytes should not fail"),
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

        assert_eq!(keys.private.to_bytes().len(), 32);
        assert_eq!(keys.public.to_bytes().len(), 32);

        let secret_b64 = keys.private.to_base64();
        assert_eq!(secret_b64, "Vo2w1c+HJCnw9PKFDzY3b2qxtecrNVzY8W45JamjSyA=");

        let secret_hex = keys.private.to_hex();
        assert_eq!(secret_hex, "568db0d5cf872429f0f4f2850f36376f6ab1b5e72b355cd8f16e3925a9a34b20");

        let public_b64 = keys.public.to_base64();
        assert_eq!(public_b64, "1AXzLxbjJp5IUxgrZ/ZYSj0qsKRPNLrpw35y537NhtI=");

        let public_hex = keys.public.to_hex();
        assert_eq!(public_hex, "d405f32f16e3269e4853182b67f6584a3d2ab0a44f34bae9c37e72e77ecd86d2");
    }
}
