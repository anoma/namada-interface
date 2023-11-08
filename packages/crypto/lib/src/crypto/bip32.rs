use crate::crypto::pointer_types::{StringPointer, VecU8Pointer};
use slip10_ed25519;
use thiserror::Error;
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[derive(Debug, Error)]
pub enum HDWalletError {
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

    pub fn to_bytes(&self) -> VecU8Pointer {
        VecU8Pointer::new(Vec::from(self.bytes))
    }

    pub fn to_hex(&self) -> StringPointer {
        let bytes: &[u8] = &self.bytes;
        let string = hex::encode(&bytes);
        StringPointer::new(string)
    }
}

/// An ed25519 keypair
#[wasm_bindgen]
#[derive(Zeroize, ZeroizeOnDrop)]
pub struct Keypair {
    private: Key,
}

#[wasm_bindgen]
impl Keypair {
    pub fn private(&self) -> Key {
        Key {
            bytes: self.private.bytes,
        }
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

    /// Derive account from a seed and a path
    pub fn derive(&self, path: Vec<u32>) -> Result<Keypair, String> {
        let key = slip10_ed25519::derive_ed25519_private_key(&self.seed, &path);
        let private = Key::new(Vec::from(key))?;

        Ok(Keypair { private })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::bip39::Mnemonic;

    #[test]
    fn can_derive_keys_from_path() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic =
            Mnemonic::from_phrase(phrase.into()).expect("Should not fail with a valid phrase!");
        let seed = mnemonic.to_seed(None).unwrap();
        let bip44: HDWallet = HDWallet::new(seed).unwrap();
        let path = vec![44, 877, 0, 0, 0];

        let keys = bip44.derive(path).expect("Should derive keys from a path");
        let secret_hex = &keys.private.to_hex().string;
        assert_eq!(
            secret_hex,
            "2493640b28d0ab262451713fdff14d6fb5e5c4d2652f1e3aba301e23fe5c4442"
        );
    }

    #[test]
    #[should_panic]
    fn invalid_seed_should_panic() {
        let _bip44 = HDWallet::new(VecU8Pointer::new(vec![0, 1, 2, 3, 4])).unwrap();
    }

    #[test]
    #[should_panic]
    fn invalid_key_should_panic() {
        let _key = Key::new(vec![0, 1, 2, 3, 4]).unwrap();
    }
}
