use crate::crypto::pointer_types::{StringPointer, VecU8Pointer};
use rand::{rngs::OsRng, RngCore};
use slip10_ed25519;
use thiserror::Error;
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[derive(Debug, Error)]
pub enum HDWalletError {
    #[error("Unable to derive keys from path")]
    DerivationError,
    #[error("Invalid key size")]
    InvalidKeySize,
    #[error("Invalid seed")]
    InvalidSeed,
}

#[wasm_bindgen]
#[derive(Zeroize)]
pub struct Key {
    bytes: [u8; 32],
}

/// A 32 byte ed25519 key
#[wasm_bindgen]
impl Key {
    #[wasm_bindgen(constructor)]
    pub fn new(bytes: Vec<u8>) -> Result<Key, String> {
        let bytes: [u8; 32] = match bytes.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(format!("{}: {:?}", HDWalletError::InvalidKeySize, err)),
        };

        Ok(Key { bytes })
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        Vec::from(self.bytes)
    }

    pub fn to_hex(&self) -> StringPointer {
        let bytes: &[u8] = &self.bytes;
        let string = hex::encode(bytes);
        StringPointer::new(string)
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct HDWallet {
    seed: [u8; 64],
}

/// A set of methods to derive keys from a BIP32/BIP44 path
#[wasm_bindgen]
impl HDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed_ptr: VecU8Pointer) -> Result<HDWallet, String> {
        let seed: [u8; 64] = match seed_ptr.vec.clone().try_into() {
            Ok(seed) => seed,
            Err(err) => return Err(format!("{}: {:?}", HDWalletError::InvalidSeed, err)),
        };

        Ok(HDWallet { seed })
    }

    pub fn from_seed(seed: Vec<u8>) -> Result<HDWallet, String> {
        let seed: [u8; 64] = match seed.try_into() {
            Ok(seed) => seed,
            Err(err) => return Err(format!("{}: {:?}", HDWalletError::InvalidSeed, err)),
        };

        Ok(HDWallet { seed })
    }

    /// Derive account from a seed and a path
    pub fn derive(&self, path: Vec<u32>) -> Result<Key, String> {
        let key = slip10_ed25519::derive_ed25519_private_key(&self.seed, &path);
        let private = Key::new(Vec::from(key))
            .map_err(|err| format!("{}: {:?}", HDWalletError::DerivationError, err))?;

        Ok(private)
    }

    pub fn disposable_keypair() -> Result<Key, String> {
        let path = vec![44, 877, 0, 0, 0];
        let mut key = [0u8; 32];
        OsRng.fill_bytes(&mut key);

        let key = slip10_ed25519::derive_ed25519_private_key(&key, &path);

        Key::new(Vec::from(key))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::bip39::Mnemonic;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_derive_keys_from_path() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic =
            Mnemonic::from_phrase(phrase.into()).expect("Should not fail with a valid phrase!");
        let seed = mnemonic.to_seed(None).unwrap();
        let bip44: HDWallet = HDWallet::new(seed).unwrap();
        let path = vec![44, 877, 0, 0, 0];

        let key = bip44.derive(path).expect("Should derive keys from a path");

        assert_eq!(
            key.to_bytes(),
            [
                228, 104, 14, 30, 58, 200, 239, 116, 140, 154, 151, 251, 162, 132, 183, 188, 107,
                0, 45, 182, 36, 48, 46, 39, 113, 29, 252, 73, 44, 242, 125, 30
            ]
        );
    }

    // TODO: we use test instead of wasm_bindgen_test because we want to catch the panic
    #[wasm_bindgen_test]
    fn invalid_seed_should_panic() {
        let res = HDWallet::new(VecU8Pointer::new(vec![0, 1, 2, 3, 4]));

        assert!(res.is_err());
    }

    #[wasm_bindgen_test]
    fn invalid_key_should_panic() {
        let res = Key::new(vec![0, 1, 2, 3, 4]);

        assert!(res.is_err());
    }
}
