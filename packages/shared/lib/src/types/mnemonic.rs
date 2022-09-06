use std::str;
use orion::{aead, kdf};
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[allow(missing_docs)]
#[derive(Debug, Error)]
pub enum DecryptionError {
    #[error("Unexpected encryption salt")]
    BadSalt,
    #[error("Unable to decrypt the mnemonic. Is the password correct?")]
    DecryptionError,
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum PhraseSize {
    N12 = 12,
    N24 = 24,
}

#[wasm_bindgen]
pub struct Mnemonic {
    phrase: String,
}

#[wasm_bindgen]
impl Mnemonic {
    pub fn new(size: PhraseSize) -> Mnemonic {
        use rand_bip::prelude::ThreadRng;
        use rand_bip::thread_rng;
        let mut rng: ThreadRng = thread_rng();
        Mnemonic {
            phrase: bip39::Mnemonic::generate_in_with(&mut rng, bip39::Language::English, size as usize)
                .unwrap()
                .to_string(),
        }
    }

    pub fn phrase(&self) -> String {
        String::from(&self.phrase)
    }

    pub fn from_phrase(phrase: String) -> Mnemonic {
        Mnemonic {
            phrase
        }
    }

    pub fn to_encrypted(&self, password: String) -> Vec<u8> {
        let salt = encryption_salt();
        let encryption_key = encryption_key(&salt, password);
        let phrase = self.phrase();
        let data = phrase.as_bytes();

        let encrypted_keypair =
            aead::seal(&encryption_key, &data).expect("Encryption of data shouldn't fail");

        let encrypted_data = [salt.as_ref(), &encrypted_keypair].concat();

        encrypted_data
    }

    pub fn from_encrypted(encrypted: Vec<u8>, password: String) -> Result<Mnemonic, JsValue> {
        let salt_len = encryption_salt().len();
        let (raw_salt, cipher) = encrypted.split_at(salt_len);

        let salt = kdf::Salt::from_slice(raw_salt).map_err(|_| DecryptionError::BadSalt)
            .expect("Could not pull salt from slice");

        let encryption_key = encryption_key(&salt, password);

        let decrypted_data: &[u8] =
            &aead::open(&encryption_key, cipher)
                .map_err(|_| JsValue::from(&DecryptionError::DecryptionError.to_string()))?;

        let s = match str::from_utf8(decrypted_data) {
            Ok(v) => v,
            Err(error) => return Err(error.to_string().into())
        };

        Ok(Mnemonic {
            phrase: String::from(s),
        })
    }
}

/// Encryption salt
pub fn encryption_salt() -> kdf::Salt {
    kdf::Salt::default()
}

/// Make encryption secret key from a password.
pub fn encryption_key(salt: &kdf::Salt, password: String) -> kdf::SecretKey {
    kdf::Password::from_slice(password.as_bytes())
        .and_then(|password| kdf::derive_key(&password, salt, 3, 1 << 16, 32))
        .expect("Generation of encryption secret key shouldn't fail")
}
