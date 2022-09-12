use std::str;
use orion::{aead, kdf};
use thiserror::Error;
use wasm_bindgen::prelude::*;

use crate::utils::{encryption_key, encryption_salt};

#[allow(missing_docs)]
#[derive(Debug, Error)]
pub enum DecryptionError {
    #[error("Unexpected encryption salt")]
    BadSalt,
    #[error("Unable to decrypt the mnemonic. Is the password correct?")]
    DecryptionError,
}

#[wasm_bindgen]
pub struct AEAD;

#[wasm_bindgen]
impl AEAD {
    pub fn encrypt(data: Vec<u8>, password: String) -> Vec<u8> {
        let data: &[u8] = &data;
        let salt = encryption_salt();
        let encryption_key = encryption_key(&salt, password);
                let encrypted_keypair =
            aead::seal(&encryption_key, data).expect("Encryption of data shouldn't fail");

        [salt.as_ref(), &encrypted_keypair].concat()
    }

    pub fn encrypt_from_string(value: String, password: String) -> Vec<u8> {
        let data = Vec::from(value.as_bytes());
        AEAD::encrypt(data, password)
    }

    pub fn decrypt(encrypted: Vec<u8>, password: String) -> Result<String, JsValue> {
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

        Ok(String::from(s))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_decrypt_encrypted_string() {
        let password = String::from("unhackable");
        let message = String::from("My secret message");

        let encrypted = AEAD::encrypt_from_string(message.clone(), password.clone());
        let decrypted = AEAD::decrypt(encrypted, password).expect("Value should be decrypted");

        assert_eq!(decrypted, message);
    }

    #[test]
    fn can_decrypt_encrypted_data() {
        let password = String::from("unhackable");
        let message = String::from("My secret message");
        let bytes = Vec::from(message.as_bytes());

        let encrypted = AEAD::encrypt(bytes, password.clone());
        let decrypted = AEAD::decrypt(encrypted, password).expect("Value should be decrypted");

        assert_eq!(decrypted, message);
    }
}
